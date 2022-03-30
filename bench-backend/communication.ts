import { Event, BenchesSubEvent } from '../common/types';
import logger from './logger';
import EventEmitter from 'events';
import { Socket } from 'socket.io';

let ids = 0;
export default class Communication extends EventEmitter {
  private clients: Map<number, Socket>;

  constructor() {
    super();
    this.clients = new Map();
  }

  register(ws: Socket, initState: BenchesSubEvent): number {
    const id = ++ids;
    this.clients.set(id, ws);
    logger.info(`Registered new ws client with id = ${id}`);
    try {
      logger.debug(`Current benches state ${JSON.stringify(initState)}`);
      ws.emit('event', initState);
    } catch (err) {
      logger.error(err);
    }
    ws.on('publish', msg => {
      this.emit('client-publish', msg);
    });
    ws.on('request', (req, fn) => {
      this.emit('client-request', req, fn);
    });
    return id;
  }

  unregister(id: number) {
    this.clients.delete(id);
    logger.info(`Unregistered ws client with id = ${id}`);
  }

  notify = (notification: Event) => {
    this.clients.forEach((wsClient) => {
      try {
        wsClient.emit('event', notification);
      } catch (err) {
        console.error(err);
      }
    });
  }
}
