import EventEmitter from 'events';
import type WebSocket from 'ws';
import { Event, EventType } from '../common/types'

export default class WsClient extends EventEmitter {
  private ws: WebSocket;
  private heartbeatId: NodeJS.Timeout | null;

  constructor(ws: WebSocket) {
    super();
    this.ws = ws;
    this.heartbeatId = null;
    ws.on('message', (msg: string) => {
      this.emit('message', JSON.parse(msg));
    });
  }

  sendHeartbeat = () => {
    this.ws.send(JSON.stringify({
      event: EventType.HEARTBEAT,
      timestamp: Date.now(),
    }));
  }

  startHeartbeating() {
    this.heartbeatId = setInterval(this.sendHeartbeat, 1000);
  }

  stopHeartbeating() {
    if (this.heartbeatId != null) {
      clearInterval(this.heartbeatId);
    }
  }

  sendMessage(msg: Event) {
    this.ws.send(JSON.stringify(msg));
  }
}
