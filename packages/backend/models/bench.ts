import Line from './line';
import { BenchPersistent, BenchCache, BenchCacheUpdate, BenchCacheUpdateEvent, Entity,
  EventType, Bench, BenchMSD } from 'common';
import logger from '../logger';
import { IModel } from './index'
import { EventEmitter } from 'events';

const PENDING_MAX_TIME = 15 * 60 * 1000;
const PENDING_INTERVAL = 1000;
const OWNED_INTERVAL = 1000;

type MinBenchUpdate = Omit<BenchCacheUpdate, 'id' | 'name'>;

export default class BenchModel extends EventEmitter implements IModel<BenchPersistent, Bench> {
  private _pendingTimerId: NodeJS.Timeout | null = null;
  private _ownedTimerId: NodeJS.Timeout | null = null;
  private _info: BenchPersistent;
  private _cache: BenchCache;
  id: number;

  constructor(benchInfo: BenchPersistent, cachePart: BenchCache) {
    super();
    this.id = benchInfo.id;
    this._info = benchInfo;
    this._cache = cachePart;
    this.pending = this._cache.pending;
    this.owner = this._cache.owner;
  }

  getId() : number {
    return this.id;
  }

  get line() {
    return new Line(this._cache.line);
  }

  set pending (value: boolean) {
    if (value) {
      this._pendingTimerId = setInterval(this.handlePendingTimeChange.bind(this), PENDING_INTERVAL);
      this.updateCache( {
        pending: value,
      });
    } else {
      this._pendingTimerId != null && clearInterval(this._pendingTimerId);
      if (value !== this._cache.pending || this._cache.pendingTimeLeft !== PENDING_MAX_TIME) {
        this.updateCache( {
          pending: value,
          pendingTimeLeft: PENDING_MAX_TIME
        });
      }
    }
  }

  get pending (): boolean {
    return this._cache.pending;
  }

  set maintenance (value: boolean) {
    this.updateCache( {
      maintenance: value,
    });
  }

  get maintenance () : boolean {
    return this._cache.maintenance;
  }

  get name() : string {
    return this._info.name;
  }

  get owner() : number | null {
    return this._cache.owner;
  }

  set owner(user: number | null) {
    logger.info(`Bench ${this.name} is taken by user with id: ${user}`);
    if (user == null) {
      this._ownedTimerId != null && clearInterval(this._ownedTimerId);
      this._ownedTimerId = null;
      this.updateCache( {
        ownedTime: 0
      });
    } else {
      if (this._ownedTimerId == null) {
        this._ownedTimerId = setInterval(this.handleOwnedTimeChange.bind(this), OWNED_INTERVAL);
      }
    }
    this.updateCache( {
      owner: user,
    });
  }

  update(persUpdate: BenchPersistent) : BenchModel {
    this._info = persUpdate;
    return this;
  }

  updateCache (update: MinBenchUpdate | BenchCacheUpdate) {
    this._cache = Object.assign<BenchCache, MinBenchUpdate>(this._cache, update);
    this.emitCacheUpdate({
      ...{
        id: this._cache.id,
      } as BenchMSD,
      ...update,
    } as BenchCacheUpdate);
  }

  emitCacheUpdate(cache: BenchCacheUpdate) {
    this.emit(EventType.ENTITY_CACHE_UPDATE, {
      event: EventType.ENTITY_CACHE_UPDATE,
      entity: Entity.BENCH,
      cache
    } as BenchCacheUpdateEvent);
  }

  handlePendingTimeChange () {
    let timeUpdate = this._cache.pendingTimeLeft - PENDING_INTERVAL;
    if (timeUpdate <= 0) {
      this.owner != null && this.freeBench(this.owner)
    }
    this.updateCache( {
      pendingTimeLeft: timeUpdate
    });
  }

  handleOwnedTimeChange () {
    let timeUpdate = this._cache.ownedTime + OWNED_INTERVAL;
    this.updateCache( {
      ownedTime: timeUpdate
    });
  }

  requestBench(user : number) {
    if (user === this.owner) {
      if (this.pending) {
        this.pending = false;
        logger.info(`Bench ${this.name} is taken by: ${user} and confirmed.`);
      } else {
        logger.info(`Bench ${this.name} is already taken by: ${user}`);
      }
    }
    else if (this.line.hasUser(user)) {
      logger.warn(`User ${user} is already in line for bench ${this.name}`);
    }
    else {
      if (this.owner == null) {
        this.owner = user;
      } else {
        const newLine = this.line.addUser(user);
        this.updateCache({
          line: newLine
        });
      }
    }
  }

  freeBench(user : number) {
    if (user === this.owner) {
      if (this.pending) {
        logger.info(`Bench ${this.name} was taken by: ${user} but not confirmed and declined.`);
        this.pending = false
      } else {
        logger.info(`Bench ${this.name} was leaved by: ${user}`);
      }
      this.owner = null;
      if (this.line.hasNextUser()) {
        this.owner = this._seekNewOwner();
      }
    }
    if (this.line.hasUser(user)) {
      logger.info(`User ${user} leaved line for bench ${this.name}`);
      const newLine = this.line.removeUser(user);
      this.updateCache({
        line: newLine
      });
    }
  }

  _seekNewOwner() : number | null {
    let [ newOwner, newLine ] = this.line.popNextUser();
    if (newOwner) {
      this.pending = true;
      this.updateCache({
        line: newLine
      });
      logger.info(`User ${newOwner} leaved line for bench ${this.name}`);
    }
    return newOwner;
  }

  toJSON() : Bench {
    return {
      ...this._cache,
      ...this._info
    } as Bench;
  }

  stopAllActions() {
    if (this._pendingTimerId) {
      clearTimeout(this._pendingTimerId);
    }
    if (this._ownedTimerId) {
      clearTimeout(this._ownedTimerId);
    }
  }
}