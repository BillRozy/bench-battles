import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createSelector } from 'reselect';
import { ipcRenderer } from 'electron';
import { omit, uniq, reduce } from 'lodash';
import { Bench, BenchCacheUpdate } from '../../../../common/types';
import { reduxLogger } from '../../log';

export type BenchesState = {
  benchesIds: number[];
  benches: { [key: number]: Bench };
};

export const initialState: BenchesState = {
  benchesIds: [],
  benches: {},
};

export const benchesSlice = createSlice({
  name: 'benches',
  initialState,
  reducers: {
    addBench: (state: BenchesState, action: PayloadAction<Bench>) => {
      reduxLogger.info(`adding bench ${JSON.stringify(action.payload)}`);
      if (state.benchesIds.includes(action.payload.id)) {
        reduxLogger.warn(`bench is already exists`);
      } else {
        state.benchesIds.push(action.payload.id);
        state.benches = {
          ...state.benches,
          [action.payload.id]: action.payload,
        };
        ipcRenderer.send('benches-update-message', JSON.stringify(state));
      }
    },
    removeBench: (state: BenchesState, action: PayloadAction<Bench>) => {
      reduxLogger.info(`removing bench ${JSON.stringify(action.payload)}`);
      if (state.benchesIds.includes(action.payload.id)) {
        state.benches = omit(state.benches, action.payload.id);
        state.benchesIds = state.benchesIds.filter(
          (it) => it !== action.payload.id
        );
        ipcRenderer.send('benches-update-message', JSON.stringify(state));
      } else {
        reduxLogger.warn(`bench was not found`);
      }
    },
    updateBench: (state: BenchesState, action: PayloadAction<Bench>) => {
      reduxLogger.info(`updating bench ${JSON.stringify(action.payload)}`);
      if (state.benchesIds.includes(action.payload.id)) {
        state.benches[action.payload.id] = action.payload;
        ipcRenderer.send('benches-update-message', JSON.stringify(state));
      } else {
        reduxLogger.warn(`bench was not found`);
      }
    },
    addBenches: (state: BenchesState, action: PayloadAction<Bench[]>) => {
      reduxLogger.info(`adding benches ${JSON.stringify(action.payload)}`);
      state.benchesIds = action.payload.map((it) => it.id);
      state.benches = reduce(
        action.payload,
        (result: { [key: number]: Bench }, value) => {
          result[value.id] = value;
          return result;
        },
        {}
      );
      ipcRenderer.send('benches-update-message', JSON.stringify(state));
    },
    updateBenchCache: (
      state: BenchesState,
      action: PayloadAction<BenchCacheUpdate>
    ) => {
      const oldCache = state.benches[action.payload.id] as Bench;
      if (!oldCache) {
        reduxLogger.warn(`${action.payload.id} не найден!`);
        return;
      }
      state.benches[action.payload.id] = {
        ...state.benches[action.payload.id],
        ...action.payload,
      };
      ipcRenderer.send('benches-update-message', JSON.stringify(state));
    },
  },
});

export const selectors = {
  getPendingBenches: createSelector(
    [(state: BenchesState) => state.benches],

    (benches) => {
      return Object.values(benches).filter((it) => it.pending);
    }
  ),
  getOwnedBenches: createSelector(
    [(state: BenchesState) => state.benches],

    (benches) => {
      return Object.values(benches).filter((it) => it.owner != null);
    }
  ),
  getOwnersOfBenches: createSelector(
    [(state: BenchesState) => state.benches],

    (benches) => {
      return Object.values(benches)
        .filter((it) => it.owner != null)
        .map((it) => it.owner || 0);
    }
  ),
  getAvailableBuilds: createSelector(
    [(state: BenchesState) => state.benches],

    (benches) => {
      return uniq(
        Object.values(benches).map((bench) => bench.build || 'unknown')
      );
    }
  ),
  getAvailableSwVers: createSelector(
    [(state: BenchesState) => state.benches],

    (benches) => {
      return uniq(
        Object.values(benches).map((bench) => bench.swVer || 'unknown')
      );
    }
  ),
};

export const {
  addBenches,
  updateBenchCache,
  addBench,
  removeBench,
  updateBench,
} = benchesSlice.actions;

export default benchesSlice.reducer;
