import { EventEmitter } from 'events';
import MessageHandler from './message-handler';
import { Event as IEvent, BenchCommand } from '../../../common/types';
import { appLogger } from '../log';

export default class Subscription extends EventEmitter {
  private URI: string;

  private websocket: WebSocket | null;

  private messageHandler: MessageHandler;

  constructor(URI: string) {
    super();
    this.URI = URI;
    this.websocket = null;
    this.messageHandler = new MessageHandler('1');
  }

  connect() {
    this.websocket = new WebSocket(this.URI);
    this.websocket.addEventListener('open', (event: Event) => {
      appLogger.info(`Opened subscription to: ${this.URI}, ${event}`);
    });
    this.websocket.addEventListener('message', (event: MessageEvent) => {
      try {
        const json: IEvent = JSON.parse(event.data);
        if (json.event === 'heartbeat') {
          return;
        }
        this.messageHandler.handle(json);
      } catch (err) {
        appLogger.error(
          `Message from websocket is not JSON: ${event.data}`,
          err
        );
      }
    });
    this.websocket.addEventListener('close', (event: Event) => {
      this.emit('close');
      appLogger.info(
        `Close subscription to: ${this.URI}, ${JSON.stringify(event)}`
      );
    });
  }

  send(msg: BenchCommand) {
    this.websocket?.send(JSON.stringify(msg));
  }
}
