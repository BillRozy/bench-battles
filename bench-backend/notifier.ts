import WsClient from './wsclient';
import BenchManager from './bench-manager';
import WebSocket from 'ws';
import { Event } from '../common/types';

let ids = 0;
class Notifier {
  private clients: Map<number, WsClient>;
  private benchManager: BenchManager;

  constructor() {
    this.clients = new Map();
    this.benchManager = new BenchManager(this.notify.bind(this));
  }

  register(ws: WebSocket): number {
    const client = new WsClient(ws);
    const id = ++ids;
    this.clients.set(id, client);
    console.log(`Registered new ws client with id = ${id}`);
    client.startHeartbeating();
    try {
      const curState = this.benchManager.getState();
      console.log(`Current benches state ${JSON.stringify(curState)}`);
      client.sendMessage(curState);
    } catch (err) {
      console.error(err);
    }
    client.on('message', (msg) => {
      this.benchManager.handleBenchCommand(msg);
    });
    return id;
  }

  unregister(id: number) {
    const client = this.clients.get(id);
    client?.stopHeartbeating();
    this.clients.delete(id);
    console.log(`Unregistered ws client with id = ${id}`);
  }

  notify(notification: Event) {
    this.clients.forEach((wsClient) => {
      try {
        wsClient.sendMessage(notification);
      } catch (err) {
        console.error(err);
      }
    });
  }
}

export default new Notifier();
