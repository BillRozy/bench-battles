import { createClient } from 'redis';
import logger from './logger';
import { URL } from 'url';

export default async function createRedisClient() {
    let client : ReturnType<typeof createClient> | null = null;
    logger.info(process.env)
    if (process.env.REDIS_URL) {
        const url = new URL(process.env.REDIS_URL);
        logger.info('Redis url ' + url.toString())
        client = createClient({
                url: url.toString()
            }
        );
    } else {
        client = createClient();
    }

    client.on('error', (err) => logger.error('Redis Client Error ' + err));
    await client.connect();
    return client;
}