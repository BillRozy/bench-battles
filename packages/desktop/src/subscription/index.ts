import { EventEmitter } from 'events';
import { io, Socket } from 'socket.io-client';
import { BenchCommand, Command, CommandResponse } from 'common';
import { appLogger } from '../log';
import wsEventHandler from './message-handler';
import Looper, { IterableSubscription } from './looper';

export default class Subscription
  extends EventEmitter
  implements IterableSubscription
{
  private URI: string;

  private websocket: Socket | null = null;

  private connected: boolean | null = null;

  private events: Event[] = [];

  private resolvers: ((value: Event | PromiseLike<Event>) => void)[] = [];

  private looper: Looper | null = null;

  constructor(URI: string) {
    super();
    this.URI = URI;
    this.looper = new Looper(this, wsEventHandler);
    this.looper.start();
  }

  addEvent(event: Event) {
    if (this.resolvers.length > 0) {
      this.resolvers.shift()?.(event);
    } else {
      this.events.push(event);
    }
  }

  takeEvent() {
    if (this.events.length > 0) {
      const event = this.events.shift();
      if (!event) {
        return Promise.reject(new Error('Empty event!'));
      }
      return Promise.resolve<Event>(event);
    }
    return new Promise<Event>((resolve) => {
      this.resolvers.push(resolve);
    });
  }

  [Symbol.asyncIterator]() {
    return this;
  }

  async next() {
    const event = await this.takeEvent();
    return {
      value: event,
      done: false,
    } as IteratorResult<Event>;
  }

  set isConnected(val: boolean) {
    if (this.connected === val) {
      return;
    }
    this.connected = val;
    if (val) {
      this.emit('open');
    } else {
      this.emit('close');
    }
  }

  get isConnected(): boolean {
    return !!this.connected;
  }

  get ioURI() {
    return `${this.URI}`;
  }

  disconnect() {
    this.websocket?.disconnect();
  }

  connect() {
    this.websocket?.disconnect();
    this.websocket = io(this.ioURI);
    this.websocket.on('connect', () => {
      appLogger.info(`Opened subscription to: ${this.ioURI}`);
      this.isConnected = true;
    });
    this.websocket.on('event', (data) => {
      this.addEvent(data);
    });
    this.websocket.on('disconnect', () => {
      this.isConnected = false;
      appLogger.info(`Close subscription to: ${this.ioURI}`);
    });
    this.websocket.on('connect_error', (error) => {
      this.isConnected = false;
      appLogger.error(`Error in connection to: ${this.ioURI}`, error);
    });
  }

  async request(msg: Command, timeout = 5000) {
    return new Promise<CommandResponse>((resolve, reject) => {
      setTimeout(() => {
        reject(new Error(`Server didn't respond before timeout: ${timeout}ms`));
      }, timeout);
      this.websocket?.emit('request', msg, (ack: CommandResponse) => {
        resolve(ack);
      });
    });
  }

  publish(msg: BenchCommand) {
    this.websocket?.emit('publish', msg);
  }
}
