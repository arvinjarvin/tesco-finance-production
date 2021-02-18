const { EventEmitter } = require('events');
const WebSocket = require('ws');
const { PUBLIC_FEED } = require('../constants');
const { polygonSocketClient } = require('./polygonClient');

class PublicHeroSocket extends EventEmitter {
  constructor(sock) {
    super();
    this.socket = sock;
    this.publicFeed = PUBLIC_FEED;
    this.onWSSConnection = this.onWSSConnection.bind(this);
    this.onPacket = this.onPacket.bind(this);
    this.socket.on('connection', this.onWSSConnection);
    this.stockSocket = polygonSocketClient;
    this.stockSocket.on('message', this.onPacket);
    this.stockSocket.on('open', () => {
      this.init();
    });
  }

  get wss() {
    return this.socket;
  }

  onWSSConnection(ws, request, client) {
    this.sendClient(ws, {
      ev: 'R',
      recv: this.publicFeed,
    });
  }

  sendClient(c, d) {
    c.send(JSON.stringify(d));
  }

  init() {
    this.ask({
      action: 'subscribe',
      params: `A.${this.publicFeed.join(',A.')}`,
    });
  }

  ask(d) {
    this.stockSocket.send(JSON.stringify(d));
  }

  onPacket(d) {
    const packet = JSON.parse(d);
    packet.forEach((e) => {
      switch (e.ev) {
        case 'status':
          console.log(`[F_WS_PUBLIC] ${e.message}`);
          break;
        case 'A': // Second Agg
          this.socket.clients.forEach((c) => c.send(JSON.stringify(e)));
          break;
      }
    });
  }
}

module.exports = PublicHeroSocket;
