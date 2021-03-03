import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import createElectronStorage from 'redux-persist-electron-storage';
import { User } from '../../../../common/types';
import { reduxLogger } from '../../log';

const COLORS = {
  turquoise: '#55d6beff',
  honeyYellow: '#f7b32bff',
  oldRose: '#aa767cff',
  rifleGreen: '#414535ff',
  darkSlateBlue: '#4e4187ff',
  lilacLuster: '#bda2b6ff',
  bleuDeFrance: '#3083dcff',
  englishViolet: '#694873ff',
  mellowApricot: '#ffbf69ff',
  fieryRose: '#fc6471ff',
  brunswickGreen: '#285238',
  darkSpringGreen: '#137547',
  darkSiena: '#2C0703',
};

const CARDS_COLORS = Object.values(COLORS);

const usedColors = new Set();

const randomColor = () => {
  return CARDS_COLORS[Math.floor(Math.random() * CARDS_COLORS.length)];
};

const getRandomColor = () => {
  let color = randomColor();
  while (usedColors.has(color)) {
    color = randomColor();
  }
  usedColors.add(color);
  return color;
};

export type IUsersState = {
  all: User[];
  currentUser: User | null;
};

const initialState: IUsersState = {
  all: [],
  currentUser: null,
};

export const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    addUsers: {
      reducer: (state, action: PayloadAction<User[]>) => {
        reduxLogger.info(`adding users ${JSON.stringify(action.payload)}`);
        state.all = [...state.all, ...action.payload];
      },
      prepare: (users: User[]) => {
        const preparedUsers = users
          .map((user) => {
            user.color = getRandomColor();
            return user;
          })
          .sort((a, b) => {
            if (a.name > b.name) {
              return 1;
            }
            if (a.name < b.name) {
              return -1;
            }
            return 0;
          });
        return { payload: preparedUsers };
      },
    },
    selectUser: (state, action) => {
      reduxLogger.info(`selecting user ${JSON.stringify(action.payload)}`);
      state.currentUser = action.payload;
    },
    selectUserByName: (state, action) => {
      reduxLogger.info(
        `selecting user by name ${JSON.stringify(action.payload)}`
      );
      const user = state.all.find((it) => it.name === action.payload);
      state.currentUser = user || null;
    },
  },
});

export const { addUsers, selectUser, selectUserByName } = usersSlice.actions;

const persistConfig = {
  key: 'root',
  storage: createElectronStorage(),
  whitelist: ['currentUser'],
  blacklist: [],
};

export default persistReducer(persistConfig, usersSlice.reducer);
