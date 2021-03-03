import { createStore, combineReducers } from '@reduxjs/toolkit';
import { composeWithDevTools } from 'redux-devtools-extension';
import { persistStore } from 'redux-persist';
import benches from './slices/benchesSlice';
import users from './slices/usersSlice';

const rootReducer = combineReducers({
  benches,
  users,
});

const store: any = createStore(rootReducer, composeWithDevTools());

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export default store;
