import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { updateTicker, getAllTickers, AVAILABLE_SYMBOLS } from './marketData';
import { WebSocketMessage, SubscribeMessage } from './types';

interface ClientState {
  subscriptions: Set<string>;
}

const clients = new Map<WebSocket, ClientState>();

export function createWebSocketServer(port: number): WebSocketServer {
  const wss = new WebSocketServer({ port });

  // Broadcast ticker updates every 800ms
  setInterval(() => {
    if (clients.size === 0) return;

    // Update all tickers
    for (const symbol of AVAILABLE_SYMBOLS) {
      updateTicker(symbol);
    }

    // Send updates to subscribed clients
    const allTickers = getAllTickers();
    clients.forEach((state, ws) => {
      if (ws.readyState !== WebSocket.OPEN) return;

      if (state.subscriptions.size === 0) {
        // Send all tickers snapshot
        send(ws, { type: 'snapshot', data: allTickers });
      } else {
        // Send only subscribed tickers
        for (const symbol of state.subscriptions) {
          const ticker = allTickers.find((t) => t.symbol === symbol);
          if (ticker) send(ws, { type: 'ticker_update', symbol, data: ticker });
        }
      }
    });
  }, 800);

  wss.on('connection', (ws: WebSocket, _req: IncomingMessage) => {
    const state: ClientState = { subscriptions: new Set() };
    clients.set(ws, state);

    // Send initial snapshot
    send(ws, { type: 'snapshot', data: getAllTickers() });

    ws.on('message', (raw) => {
      try {
        const msg: SubscribeMessage = JSON.parse(raw.toString());
        if (msg.type === 'subscribe' && AVAILABLE_SYMBOLS.includes(msg.symbol)) {
          state.subscriptions.add(msg.symbol);
          send(ws, { type: 'subscribed', symbol: msg.symbol });
        } else if (msg.type === 'unsubscribe') {
          state.subscriptions.delete(msg.symbol);
          send(ws, { type: 'unsubscribed', symbol: msg.symbol });
        }
      } catch {
        send(ws, { type: 'error', message: 'Invalid message format' });
      }
    });

    ws.on('close', () => clients.delete(ws));
    ws.on('error', () => clients.delete(ws));
  });

  return wss;
}

function send(ws: WebSocket, msg: WebSocketMessage) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(msg));
  }
}
