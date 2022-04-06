import { io, Socket } from 'socket.io-client';
import { BenchCommand, Command, CommandResponse } from 'common';
import { fromEvent, merge, map } from 'rxjs';
import { appLogger } from '../log';

export { default as wsEventHandler } from './message-handler';

export default class Subscription {
  private websocket: Socket | null = null;

  static ioURI(uri: string) {
    return `${uri}`;
  }

  disconnect() {
    this.websocket?.disconnect();
  }

  connect(uri: string) {
    this.websocket?.disconnect();
    this.websocket = io(Subscription.ioURI(uri));
    return {
      stateObservable: merge(
        fromEvent(this.websocket, 'connect').pipe(map(() => true)),
        fromEvent(this.websocket, 'disconnect').pipe(map(() => false)),
        fromEvent(this.websocket, 'connect_error').pipe(
          map((err) => {
            appLogger.error(
              `Error in connection to: ${Subscription.ioURI(uri)}`,
              err
            );
            return false;
          })
        )
      ),
      eventObservable: fromEvent(this.websocket, 'event'),
    };
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
