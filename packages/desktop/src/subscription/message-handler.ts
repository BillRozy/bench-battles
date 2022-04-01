import {
  EntityCacheUpdateEvent,
  Event,
  BenchesSubEvent,
  Entity,
  EventType,
  BenchCacheUpdate,
  CrudEvent,
  CrudEntityEvent,
  WithID,
  User,
  Bench,
} from 'common';
import {
  addBenches,
  updateBenchCache,
  addBench,
  removeBench,
  updateBench,
} from '../redux/slices/benchesSlice';
import {
  addUsers,
  addUser,
  updateUser,
  removeUser,
} from '../redux/slices/usersSlice';
import { setDbVersion } from '../redux/slices/preferencesSlice';
import store from '../redux/store';

import { appLogger } from '../log';

const CRUD_MAPPING = {
  [Entity.USER]: {
    [CrudEntityEvent.ENTITY_CREATED]: (data: WithID) => addUser(data as User),
    [CrudEntityEvent.ENTITY_REMOVED]: (data: WithID) =>
      removeUser(data as User),
    [CrudEntityEvent.ENTITY_UPDATED]: (data: WithID) =>
      updateUser(data as User),
  },
  [Entity.BENCH]: {
    [CrudEntityEvent.ENTITY_CREATED]: (data: WithID) => addBench(data as Bench),
    [CrudEntityEvent.ENTITY_REMOVED]: (data: WithID) =>
      removeBench(data as Bench),
    [CrudEntityEvent.ENTITY_UPDATED]: (data: WithID) =>
      updateBench(data as Bench),
  },
};

const handleEntityUpdate = (json: EntityCacheUpdateEvent) => {
  // appLogger.debug(
  //   `${this.constructor.name} v${this.ver}: handleEntityUpdate`
  // );
  const { entity, cache } = json;
  switch (entity) {
    case Entity.BENCH:
      store.dispatch(updateBenchCache(cache as BenchCacheUpdate));
      break;
    default:
      appLogger.warn(`Unknown entity '${entity}' update`);
  }
};

export default (json: Event) => {
  // appLogger.debug(
  //   `${this.constructor.name} v${this.ver}: got message - ${JSON.stringify(
  //     json
  //   )}`
  // );
  switch (json.event) {
    case EventType.ENTITY_CACHE_UPDATE: {
      handleEntityUpdate(json as EntityCacheUpdateEvent);
      break;
    }
    case EventType.INITIAL_BENCHES_STATE: {
      const { benches, users, version } = json as BenchesSubEvent;
      store.dispatch(addUsers(users));
      store.dispatch(addBenches(benches));
      store.dispatch(setDbVersion(version || 'unknown'));
      break;
    }
    case CrudEntityEvent.ENTITY_CREATED:
    case CrudEntityEvent.ENTITY_REMOVED:
    case CrudEntityEvent.ENTITY_UPDATED: {
      const { entity, data, event } = json as CrudEvent;
      store.dispatch(CRUD_MAPPING[entity][event](data));
      break;
    }
    default:
      break;
  }
};
