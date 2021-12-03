import { CaseReducer, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ipcRenderer } from 'electron';
import { mapValues } from 'lodash';
import { persistReducer } from 'redux-persist';
import createElectronStorage from 'redux-persist-electron-storage';
import { User } from '../../../../common/types';
import { reduxLogger } from '../../log';

type CustomCaseReducerWithPrepare<T> = {
  reducer: CaseReducer<UsersState, PayloadAction<T>>;
  prepare: (
    arg: T
  ) => {
    payload: T;
  };
};

export type UsersState = {
  all: User[];
  currentUser: User | null;
};

export const initialState: UsersState = {
  all: [],
  currentUser: null,
};

function notifyToTrayWrap<T>(
  reducerOrWrapper:
    | CaseReducer<UsersState, PayloadAction<T>>
    | CustomCaseReducerWithPrepare<T>
): CaseReducer<UsersState, PayloadAction<T>> {
  return (state: UsersState, action: PayloadAction<T>) => {
    if ('reducer' in reducerOrWrapper && 'prepare' in reducerOrWrapper) {
      const prepared = reducerOrWrapper.prepare(action.payload);
      reducerOrWrapper.reducer(state, {
        type: action.type,
        payload: prepared.payload,
      });
    } else {
      reducerOrWrapper(state, action);
    }
    reduxLogger.debug(`user-update-sent: ${JSON.stringify(state)}`);
    ipcRenderer.send('users-update-message', JSON.stringify(state));
  };
}

export const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    addUsers: notifyToTrayWrap<User[]>({
      reducer: (state: UsersState, action: PayloadAction<User[]>) => {
        reduxLogger.info(`adding users ${JSON.stringify(action.payload)}`);
        state.all = [...action.payload];
        if (state.currentUser != null) {
          state.currentUser =
            state.all.find((it: User) => state.currentUser?.id === it.id) ||
            null;
        }
      },
      prepare: (users: User[]) => {
        const preparedUsers = users
          .map((user) => {
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
        return {
          payload: preparedUsers,
        };
      },
    }),
    ...mapValues(
      {
        addUser: (state: UsersState, action: PayloadAction<User>) => {
          reduxLogger.info(`adding user ${JSON.stringify(action.payload)}`);
          state.all = [...state.all, action.payload];
        },
        removeUser: (state: UsersState, action: PayloadAction<User>) => {
          reduxLogger.info(`removing user ${JSON.stringify(action.payload)}`);
          state.all = state.all.filter((it) => it.id !== action.payload.id);
          if (state.currentUser?.id === action.payload.id) {
            state.currentUser = null;
          }
        },
        updateUser: (state: UsersState, action: PayloadAction<User>) => {
          reduxLogger.info(`updating user ${JSON.stringify(action.payload)}`);
          state.all = state.all.map((it) =>
            it.id === action.payload.id ? action.payload : it
          );
          if (state.currentUser?.id === action.payload.id) {
            state.currentUser =
              state.all.find((it: User) => state.currentUser?.id === it.id) ||
              null;
          }
        },
        selectUser: (state: UsersState, action: PayloadAction<User>) => {
          if (action.payload.id === 0) {
            reduxLogger.info('Exiting from user dashboard, no user selected');
            state.currentUser = null;
          } else {
            reduxLogger.info(
              `selecting user ${JSON.stringify(action.payload)}`
            );
            state.currentUser = action.payload;
          }
        },
      },
      (it) => notifyToTrayWrap<User>(it)
    ),
  },
});

export const {
  addUsers,
  selectUser,
  addUser,
  removeUser,
  updateUser,
} = usersSlice.actions;

const persistConfig = {
  key: 'root',
  storage: createElectronStorage(),
  whitelist: ['currentUser'],
  blacklist: [],
};

export default persistReducer(persistConfig, usersSlice.reducer);
