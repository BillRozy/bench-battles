import { EventEmitter } from 'events';
import { io, Socket } from 'socket.io-client';
import { BenchCommand, Command, CommandResponse } from 'common';
import { appLogger } from '../log';
import { ErrorType } from 'typescript-logging';
import { wsEventHandler } from './message-handler';


export class Looper {
  private subscription: Subscription;
  private handler: (arg: any) => any;

  constructor(subscription: Subscription, handler: (arg: any) => any) {
    this.subscription = subscription;
    this.handler = handler;
  }
  async start() {
    for await (const event of this.subscription) {
      try {
        this.handler(event);
      } catch (err) {
        appLogger.error(
          `Message from websocket is not JSON: ${event}`,
          err as ErrorType
        );
      }
    }
  }
}

export default class Subscription extends EventEmitter {
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

  _addEvent(event: Event) {
    if (this.resolvers.length > 0) {
      const resolver = this.resolvers.shift();
      resolver && resolver(event);
    } else {
      this.events.push(event);
    }
  }

  _takeEvent() {
    if (this.events.length > 0) {
      const event = this.events.shift();
      if (!event) {
        return Promise.reject(new Error('Empty event!'))
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

  next() {
    return this._takeEvent().then(val => ({ value: val, done: false}));
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

  disconnect() {
    this.websocket?.disconnect();
  }

  connect() {
    this.websocket?.disconnect();
    this.websocket = io(this.URI, {
      transports: ['websocket'],
    });
    this.websocket.on('connect', () => {
      appLogger.info(`Opened subscription to: ${this.URI}`);
      this.isConnected = true;
    });
    this.websocket.on('event', (data) => {
      this._addEvent(data);
    });
    this.websocket.on('disconnect', () => {
      this.isConnected = false;
      appLogger.info(`Close subscription to: ${this.URI}`);
    });
    this.websocket.on('connect_error', (error) => {
      this.isConnected = false;
      appLogger.error(`Error in to: ${this.URI}`, new Error(error.message));
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
