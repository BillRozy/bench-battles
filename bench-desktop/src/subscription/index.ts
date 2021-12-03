import { EventEmitter } from 'events';
import { io, Socket } from 'socket.io-client';
import { ErrorType } from 'typescript-logging';
import MessageHandler from './message-handler';
import { BenchCommand, Command, CommandResponse } from '../../../common/types';
import { appLogger } from '../log';

export default class Subscription extends EventEmitter {
  private URI: string;

  private websocket: Socket | null;

  private connected: boolean | null;

  constructor(URI: string) {
    super();
    this.URI = URI;
    this.connected = null;
    this.websocket = null;
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
      try {
        MessageHandler.handle(data);
      } catch (err) {
        appLogger.error(
          `Message from websocket is not JSON: ${data}`,
          err as ErrorType
        );
      }
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
