import 'localenv';
import { Server } from "socket.io";
import { PrismaClient } from '@prisma/client';
import Communication from './communication';
import getRedisClient from './redis';
import PersistentStateManager from './state/persistent';
import CacheStateManager from './state/cache';
import BenchManager from './bench-manager';
import logger from './logger';
import { BenchCommand, CrudCommand, Command, EntityCommand,
        CrudEvent, CrudEntityEvent, OtherCommand } from '../common/types';
import createCRUD from './crud';


const prisma = new PrismaClient();
const crud = createCRUD(prisma);
const io = new Server({
  transports: ['websocket'],
});

const eventsMapping = {
  [CrudCommand.CREATE_ENTITY]: CrudEntityEvent.ENTITY_CREATED,
  [CrudCommand.DELETE_ENTITY]: CrudEntityEvent.ENTITY_REMOVED,
  [CrudCommand.UPDATE_ENTITY]: CrudEntityEvent.ENTITY_UPDATED,
}

async function main() {
  const persistentStateManager = new PersistentStateManager(prisma);
  const cacheStateManager = new CacheStateManager(await getRedisClient());
  const communication = new Communication();
  const benchManager = new BenchManager(persistentStateManager, cacheStateManager);
  await benchManager.initialize(communication.notify);
  communication
  .on('client-request', async (msg : Command, fn) => {
    if (msg.command === OtherCommand.RESET_CACHE) {
      logger.info('Cache reset requested...');
      await cacheStateManager.clear();
      logger.info('Cache reset complete, recreating app models...');
      await benchManager.initialize(communication.notify);
      logger.debug(`Current benches state ${JSON.stringify(benchManager.getState())}`);
      communication.notify(benchManager.getState());
      fn({
        success: true
      });
      logger.info('Reset complete!');
      return;
    }
    const { entity, data, command } = msg as EntityCommand;
    const meth = (crud[entity])[command] || null;
    if (meth == null) {
      return;
    }
    try {
      let result = await meth(data);
      const resultWithCache = await benchManager.applyCrudEffectToCache(msg.command as CrudCommand, entity, result);
      if (resultWithCache) {
        fn({
          success: true
        });
        communication.notify({
          event: eventsMapping[command],
          entity,
          data: resultWithCache
        } as CrudEvent)
      } else {
        fn({
          success: false
        });
      }
    } catch (err) {
      logger.error('Can\'t handle ' + command + ' for ' + entity + ', \n ' + err);
      fn({
        success: false,
        error: (err as Error).message
      });
    }
  })
  .on('client-publish', async (msg: BenchCommand) => {
    benchManager.handleBenchCommand(msg as BenchCommand);
  })

  io.on("connection", (socket) => {
    const id = communication.register(socket, benchManager.getState());
    logger.info(`Adding connection: ${socket.client.request.url}`);
    socket.on('disconnect', () => {
      communication.unregister(id);
    });
    socket.on('error', (err) => {
      logger.error(err.message);
    })
  });


  io.listen(parseInt(process.env.PORT || '55555'));
  logger.info(`Listening`);
}

main().catch((e) => {
  throw e
})
.finally(async () => {
  await prisma.$disconnect()
});


