import { createClient } from 'redis';
import logger from './logger';
import { URL } from 'url';

export default async function createRedisClient() {
    let client : ReturnType<typeof createClient> | null = null;
    if (process.env.REDISTOGO_URL) {
        const rtg = new URL(process.env.REDISTOGO_URL);
        logger.info('Redis url ' + rtg.toString())
        client = createClient({
                url: `${rtg.protocol}//${rtg.hostname}:${rtg.port}/`,
                password: rtg.password,
            }
        );
    } else {
        client = createClient();
    }

    client.on('error', (err) => logger.error('Redis Client Error ' + err));
    await client.connect();
    return client;
}