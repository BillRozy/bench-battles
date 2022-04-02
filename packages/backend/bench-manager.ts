import BenchModel from './models/bench';
import UserModel from './models/user';
import { IModel } from './models';
import { BenchCommand, BenchesSubEvent, EventType, OtherCommand, Bench, User,
         UserPrisma, BenchCacheUpdateEvent, CrudCommand, Entity, BenchPrisma, WithID } from 'common';
import { fromEvent, from, firstValueFrom } from 'rxjs';
import { bufferTime, concatMap, toArray } from 'rxjs/operators';
import { merge } from 'lodash';
import PersistentStateManager from './state/persistent'
import CacheStateManager from './state/cache'
import logger from './logger';
import EventEmitter from 'events';


abstract class ModelManager<T extends IModel<V, K>, V extends WithID = WithID, K extends WithID = WithID> extends EventEmitter {
  protected models : Map<number, T> = new Map();
  protected persistentManager: PersistentStateManager;
  protected cacheManager: CacheStateManager;
  protected notifier: Function | undefined;
  constructor(persistent : PersistentStateManager, cache : CacheStateManager, notifier?: Function) {
    super();
    this.persistentManager = persistent;
    this.cacheManager = cache;
    this.notifier = notifier;
  }

  abstract create(from: V) : Promise<T>;

  async createAll(fromArg: V[]) : Promise<T[]> {
    return firstValueFrom(from(fromArg).pipe(concatMap(it => this.create(it)), toArray()));
  }

  stopAll() {
    this.models.forEach(model => {
      model.stopAllActions();
    })
  }

  add(model: T) {
    this.models.set(model.getId(), model);
  }

  addAll(models: T[]) {
    models.forEach(model => {
      this.add(model);
    })
  }

  update(rawData: V) : IModel<V, K> | undefined {
    this.get(rawData.id)?.update(rawData);
    return this.get(rawData.id);
  }

  remove(obj: WithID) : IModel<V, K> | undefined {
    const model = this.get(obj.id);
    this.models.delete(obj.id);
    return model;
  }

  get(key: number) : T | undefined {
    return this.models.get(key);
  }

  getAsJSON(key: number) : K | undefined {
    return this.get(key)?.toJSON();
  }

  getAllAsJSON() : K[] {
    const result = [];
    for (const key of this.models.keys()) {
      const json = this.getAsJSON(key);
      if (json) {
        result.push(json);
      }
    }
    return result;
  }
}

class BenchModelManager extends ModelManager<BenchModel, BenchPrisma, Bench> {
  async create(from: BenchPrisma) : Promise<BenchModel> {
    const benchCache = await this.cacheManager.loadBenchCache(from.id) || await this.cacheManager.createBenchCache(from);
    const bench = new BenchModel(from, benchCache);
    const benchEvents = fromEvent<BenchCacheUpdateEvent>(bench, EventType.ENTITY_CACHE_UPDATE);
    const buffered = benchEvents.pipe(bufferTime(250));
    buffered.subscribe({
      next: (val: BenchCacheUpdateEvent[]) => {
        if (val.length === 0) return;
        const update = val.reduce<BenchCacheUpdateEvent>((prev, next) => {
          return {
            event: prev.event,
            entity: prev.entity,
            cache: merge(prev.cache, next.cache)
          }
        }, val[0]);
        this.cacheManager.updateBenchCache(update.cache, true);
        this.notifier && this.notifier(update);
      }
    });
    this.add(bench);
    return bench;
  }
}

class UserModelManager extends ModelManager<UserModel, UserPrisma, User> {
  async create({ name, id, color }: UserPrisma) : Promise<UserModel> {
    const user = new UserModel(name, id, color || undefined);
    this.add(user);
    return Promise.resolve(user);
  }
}


export default class BenchManager {
  private persistentManager: PersistentStateManager;
  private cacheManager: CacheStateManager;
  private cache: Map<Entity, ModelManager<IModel>> = new Map();
  private version: number | null = null;
  constructor(persistentManager: PersistentStateManager, cacheManager: CacheStateManager) {
    this.persistentManager = persistentManager;
    this.cacheManager = cacheManager;
  }

  async initialize(notifier?: (...args: any) => void ) {
    this.cache.forEach(manager => {
      manager.stopAll();
    });
    this.cache.set(Entity.BENCH, new BenchModelManager(this.persistentManager, this.cacheManager, notifier));
    this.cache.set(Entity.USER, new UserModelManager(this.persistentManager, this.cacheManager, notifier));
    const persistentState = await this.persistentManager.load();
    this.version = persistentState.version;
    if (!await this.cacheManager.hasCache() || !await this.cacheManager.isCacheVersionOK(persistentState.version)) {
      logger.info('Doesn\'t have cache or it is outdated, so need to create it...');
      await this.cacheManager.create(persistentState);
    }
    logger.info('Cache was created!');
    for (const [entity, manager] of this.cache.entries()) {
      manager.addAll(await manager.createAll(persistentState[entity]));
      logger.info(`Added models for ${entity}`);
    }
    logger.info('App cache initialized!');
  }

  createEntity = async (data: any, entity: Entity) : Promise<IModel | undefined> => {
    const manager = this.cache.get(entity);
    if (manager) {
      return manager.create(data);
    }
    return Promise.resolve(undefined);
  }

  addEntity = (model: IModel, entity: Entity) => {
    const manager = this.cache.get(entity);
    if (manager) {
      manager.add(model);
    }
  }

  getEntity = (key: number, entity: Entity) : IModel | undefined => {
    const manager = this.cache.get(entity);
    if (manager) {
      return manager.get(key);
    }
    return undefined;
  }

  deleteEntity = (data: WithID, entity: Entity) : IModel | undefined => {
    const manager = this.cache.get(entity);
    if (manager) {
      return manager.remove(data);
    }
    return undefined;
  }

  updateEntity = (data: any, entity: Entity) => {
    const manager = this.cache.get(entity);
    if (manager) {
      return manager.update(data);
    }
    return undefined;
  }

  private CRUD_MAP = {
    [CrudCommand.CREATE_ENTITY]: this.createEntity,
    [CrudCommand.DELETE_ENTITY]: this.deleteEntity,
    [CrudCommand.UPDATE_ENTITY]: this.updateEntity,
  }

  getState() : BenchesSubEvent {
    return {
      ...this.getRawState(),
      event: EventType.INITIAL_BENCHES_STATE,
    };
  }

  getRawState = (): { benches: Bench[], users: User[], version: number | null } => {
    return {
      benches: this.getBenchesState(),
      users: this.getUsersState(),
      version: this.version
    }
  }

  getUsersState() : User[] {
    return this.cache.get(Entity.USER)?.getAllAsJSON() as User[] || [];
  }

  getBenchesState() : Bench[] {
    return this.cache.get(Entity.BENCH)?.getAllAsJSON() as Bench[] || [];
  }

  handleBenchCommand(wsJson: BenchCommand) {
    logger.debug(`Started handling command ${JSON.stringify(wsJson)}`);
    const { command, benchId, userId } = wsJson;
    const bench = this.cache.get(Entity.BENCH)?.get(benchId) as BenchModel;
    const user = this.cache.get(Entity.USER)?.get(userId) as UserModel;
    if (bench == null) {
      logger.warn(`Unrecognized bench id ${benchId}`);
      return;
    }
    if (user == null) {
      logger.warn(`Unrecognized user id ${userId}`);
      return;
    }
    switch (command) {
      case OtherCommand.REQUEST_BENCH:
        bench.requestBench(userId);
        break;
      case OtherCommand.FREE_BENCH:
        bench.freeBench(userId);
        break;
      case OtherCommand.TOGGLE_MAINTENANCE_BENCH:
        bench.maintenance = !bench.maintenance;
        break;
      default:
        logger.warn(`Unrecognized command ${command}`);
    }
    logger.debug(`Handled command ${JSON.stringify(wsJson)}`);
  }

  // CRUD

  async applyCrudEffectToCache(crudCommand: CrudCommand, crudEntity: Entity, data: any) {
    logger.debug(`applyCrudEffectToCache ${crudCommand} ${crudEntity} ${JSON.stringify(data)}`);
    return this.CRUD_MAP[crudCommand](data, crudEntity);
  }
}
