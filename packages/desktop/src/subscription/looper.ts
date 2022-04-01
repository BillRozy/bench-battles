/* eslint no-restricted-syntax: "off" */

import { ErrorType } from 'typescript-logging';
import { appLogger } from '../log';

export type IterableSubscription = AsyncIterableIterator<Event>;

export default class Looper {
  private subscription: IterableSubscription;

  private handler: (arg: any) => void;

  constructor(subscription: IterableSubscription, handler: (arg: any) => void) {
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
