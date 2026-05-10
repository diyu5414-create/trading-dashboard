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

export interface WebSocketMessage {
  type: 'ticker_update' | 'subscribed' | 'unsubscribed' | 'error' | 'snapshot';
  symbol?: string;
  data?: Ticker | Ticker[];
  message?: string;
}

export interface SubscribeMessage {
  type: 'subscribe' | 'unsubscribe';
  symbol: string;
}
