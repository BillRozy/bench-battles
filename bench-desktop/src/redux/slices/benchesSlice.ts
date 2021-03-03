import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, Bench } from '../../../../common/types';
import { reduxLogger } from '../../log';
import Notifications from '../../helpers/notification';

type BenchesState = {
  benches: Bench[];
};

const initialState: BenchesState = {
  benches: [],
};

interface BenchEventPayload {
  user: User | null;
  benchName: string;
}

const doWithBench = (
  state: BenchesState,
  name: string,
  cb: (index: number) => void
) => {
  const index = state.benches.findIndex((it: Bench) => it.name === name);
  if (index === -1) {
    reduxLogger.warn(`Bench with name == ${name} doesn't exist!`);
  } else {
    cb(index);
  }
};

export const benchesSlice = createSlice({
  name: 'benches',
  initialState,
  reducers: {
    addBench: (state, action) => {
      reduxLogger.info(`adding bench ${JSON.stringify(action.payload)}`);
      state.benches.push(action.payload);
    },
    addBenches: (state, action) => {
      reduxLogger.info(`adding benches ${JSON.stringify(action.payload)}`);
      state.benches = [...state.benches, ...action.payload];
    },
    changeBenchOwner: (
      state,
      { payload }: PayloadAction<BenchEventPayload>
    ) => {
      doWithBench(state, payload.benchName, (index: number) => {
        const bench = state.benches[index];
        reduxLogger.info(
          payload.user != null
            ? `${bench.name} теперь занят ${bench.owner}.`
            : `${bench.name} теперь занят свободен.`
        );
        if (payload.user != null) {
          Notifications.BENCH_WAS_TAKEN(bench.name, payload.user.name);
        } else {
          Notifications.BENCH_IS_FREE(bench.name);
        }
        // const notification = new Notification('Bench changed owner', {
        //   body: `changing bench ${bench.name} owner from ${bench.owner} to ${payload.user}`,
        //   icon: 'ico/favicon.ico',
        // });
        // using Immer under the hood!
        state.benches[index].owner = payload.user ? payload.user.name : null;
      });
    },
    addUserToBenchLine: (
      state,
      { payload }: PayloadAction<BenchEventPayload>
    ) => {
      doWithBench(state, payload.benchName, (index: number) => {
        if (payload.user == null) {
          return;
        }
        const bench = state.benches[index];
        reduxLogger.info(
          `adding user ${payload.user} to line for ${bench.name}`
        );
        // using Immer under the hood!
        state.benches[index].line.push(payload.user.name);
      });
    },
    removeUserFromBenchLine: (
      state,
      { payload }: PayloadAction<BenchEventPayload>
    ) => {
      doWithBench(state, payload.benchName, (index: number) => {
        if (payload.user == null) {
          return;
        }
        const bench = state.benches[index];
        reduxLogger.info(
          `removing user ${payload.user.name} from line for ${bench.name}`
        );
        // using Immer under the hood!
        state.benches[index].line = state.benches[index].line.filter(
          (username) => payload.user && username !== payload.user.name
        );
      });
    },
  },
});

export const {
  addBench,
  addBenches,
  changeBenchOwner,
  addUserToBenchLine,
  removeUserFromBenchLine,
} = benchesSlice.actions;

export default benchesSlice.reducer;
