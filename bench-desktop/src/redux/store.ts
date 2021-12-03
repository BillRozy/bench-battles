import {
  createStore,
  combineReducers,
  Action,
  AnyAction,
  PayloadAction,
  Store,
  applyMiddleware,
} from '@reduxjs/toolkit';
import { composeWithDevTools } from 'redux-devtools-extension';
import { persistStore } from 'redux-persist';
import thunkMiddleware from 'redux-thunk';
import {
  Bench,
  BenchCacheFields,
  BenchCacheUpdate,
} from '../../../common/types';
import { reduxLogger } from '../log';
import Notifications from '../helpers/notification';
import users from './slices/usersSlice';
import benches from './slices/benchesSlice';
import preferences from './slices/preferencesSlice';
import interactions from './slices/interactionsSlice';

const combinedReducer = combineReducers({
  benches,
  users,
  preferences,
  interactions,
});

export type InternalCombinedState = ReturnType<typeof combinedReducer>;

export const rootReducer = (
  state: InternalCombinedState,
  action: AnyAction
): RootState => {
  if (action.type === 'benches/updateBenchCache') {
    const typedAction = action as PayloadAction<BenchCacheUpdate>;
    const oldCache = state.benches.benches[typedAction.payload.id] as Bench;
    if (!oldCache) {
      return state;
    }
    Object.entries(typedAction.payload).forEach(([key, val]) => {
      switch (key) {
        case BenchCacheFields.OWNER:
          if (val != null) {
            const user = state.users.all.find((it) => it.id === val);
            Notifications.BENCH_WAS_TAKEN(oldCache.name, user?.name);
            reduxLogger.info(`${oldCache.name} теперь занят ${user?.name}.`);
          } else {
            Notifications.BENCH_IS_FREE(oldCache.name);
            reduxLogger.info(`${oldCache.name} теперь свободен.`);
          }
          break;
        case BenchCacheFields.PENDING_TIME:
          reduxLogger.debug(
            `${oldCache.name} ожидает подтверждения, осталось:  ${val}.`
          );
          break;
        case BenchCacheFields.PENDING:
          reduxLogger.info(
            `${oldCache.name} теперь в состоянии ожидания подтверждения: ${val}.`
          );
          Notifications.BENCH_PENDING(oldCache.name, val);
          break;
        case BenchCacheFields.MAINTENANCE:
          reduxLogger.info(
            `${oldCache.name} теперь в состоянии обслуживания: ${val}.`
          );
          Notifications.BENCH_MAINTENANCE(oldCache.name, val);
          break;
        case BenchCacheFields.LINE:
          reduxLogger.info(
            `${oldCache.name} обновление в очереди, теперь это: ${val}.`
          );
          break;
        case BenchCacheFields.OWNED_TIME:
        default:
          break;
      }
    });
  }
  return combinedReducer(state, action);
};

const store: Store<InternalCombinedState, Action> = createStore<
  InternalCombinedState,
  Action,
  unknown,
  unknown
>(rootReducer as any, composeWithDevTools(applyMiddleware(thunkMiddleware)));

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;

export const useStoreState = (): RootState => store.getState();

export default store;
