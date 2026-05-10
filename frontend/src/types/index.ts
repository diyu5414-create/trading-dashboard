export interface Ticker {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high24h: number;
  low24h: number;
  lastUpdated: number;
}

export interface PricePoint {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type WebSocketMessage =
  | { type: 'snapshot'; data: Ticker[] }
  | { type: 'ticker_update'; symbol: string; data: Ticker }
  | { type: 'subscribed'; symbol: string }
  | { type: 'unsubscribed'; symbol: string }
  | { type: 'error'; message: string };

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export interface Alert {
  id: string;
  symbol: string;
  targetPrice: number;
  direction: 'above' | 'below';
  triggered: boolean;
  createdAt: number;
}
