import { BenchCache, BenchCacheUpdate, BenchPersistent, Entity } from 'common';
import logger from '../logger';
import { PersistentState } from './persistent'
import { createClient } from 'redis';

const ROOT_KEY = 'benches';
const VERSION_KEY = 'version';

export type CacheState = {
    [Entity.BENCH]: Map<string, BenchCache>
}

const INIT_BENCH_CACHE = (id: number) : BenchCache => ({
    id,
    pending: false,
    pendingTimeLeft: 900000,
    ownedTime: 0,
    maintenance: false,
    owner: null,
    line: []
});

export default class CacheStateManager {

    private redis : ReturnType<typeof createClient>;

    constructor(redis: ReturnType<typeof createClient>) {
        this.redis = redis
    }

    async create (persistentState: PersistentState) : Promise<boolean> {
        let result = true;
        await this.redis.SET(VERSION_KEY, `${persistentState.version}`);
        persistentState[Entity.BENCH].forEach(async (persistentBench) => {
            result = await this.createBenchCache(persistentBench) != null;
        });
        return Promise.resolve(result);
    }

    clear = async () => {
        return this.redis.FLUSHDB()
    }

    async createBenchCache ({ id }: BenchPersistent) : Promise<BenchCache> {
        let cache = INIT_BENCH_CACHE(id);
        try {
            await this.redis.HSET(ROOT_KEY, {
                [`${id}`]: JSON.stringify(cache)
            });
        } catch(err) {
            logger.error(err);
        }
        return Promise.resolve(cache);
    }

    async hasCache () {
        return await this.redis.EXISTS(ROOT_KEY);
    }

    async isCacheVersionOK (persistentVersion: number) {
        logger.debug('DB version is ' + persistentVersion);
        const redisVersion = parseInt(await this.redis.GET(VERSION_KEY) || '1');
        logger.debug('Redis cache version is ' + redisVersion);
        return persistentVersion === redisVersion;
    }

    updateBenchCache = async (benchInfo: BenchCache | BenchCacheUpdate, partial = false) => {
        if (partial) {
            const oldCache = await this.loadBenchCache(benchInfo.id);
            if (oldCache == null) {
                return Promise.reject(new Error('Didn\'t find old cache for bench to update'));
            }
            return this.redis.HSET(ROOT_KEY, {
                [`${benchInfo.id}`]: JSON.stringify({
                    ...oldCache,
                    ...benchInfo
                })
            });
        }
        return this.redis.HSET(ROOT_KEY, {
            [`${benchInfo.id}`]: JSON.stringify(benchInfo)
        });
    }

    async load () : Promise<CacheState> {
        const result: CacheState = {
            [Entity.BENCH]: new Map()
        }
        const entries = await this.redis.HGETALL(ROOT_KEY);
        Object.entries(entries).forEach(([key, value]) => {
            result[Entity.BENCH].set(key, JSON.parse(value) as BenchCache)
        });

        return Promise.resolve(result);
    }

    loadBenchCache = async (benchId: number) : Promise<BenchCache | null> => {
        const cache = await this.redis.HGET(
            ROOT_KEY,
            benchId + ''
        );
        if (cache == null) {
            return null
        }
        return JSON.parse(cache) as BenchCache;
    }
}