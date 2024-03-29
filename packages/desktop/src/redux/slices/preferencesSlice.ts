import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

export type PreferencesState = {
  serverURI: string;
  appVersion: string | number;
  dbVersion: string | number;
};

export const initialState: PreferencesState = {
  serverURI:
    process.env.NODE_ENV !== 'development'
      ? 'https://bench-batles-backend.onrender.com'
      : 'http://127.0.0.1:55555',
  appVersion: process.env.APP_VERSION || 'unknown',
  dbVersion: 'unknown',
};

export const prefsSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    setServerURI(state: PreferencesState, action: PayloadAction<string>) {
      state.serverURI = action.payload;
    },
    setDbVersion(
      state: PreferencesState,
      action: PayloadAction<string | number>
    ) {
      state.dbVersion = action.payload;
    },
  },
});

export const { setServerURI, setDbVersion } = prefsSlice.actions;

const persistConfig = {
  key: 'prefs',
  storage,
  whitelist: ['serverURI'],
  blacklist: ['appVersion', 'dbVersion'],
};

export default persistReducer(persistConfig, prefsSlice.reducer);
