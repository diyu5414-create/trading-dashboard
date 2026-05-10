import { Ticker, PricePoint } from './types';

const TICKER_CONFIG: Record<string, { name: string; basePrice: number; volatility: number }> = {
  'BTC-USD': { name: 'Bitcoin', basePrice: 67000, volatility: 0.015 },
  'ETH-USD': { name: 'Ethereum', basePrice: 3500, volatility: 0.018 },
  'SOL-USD': { name: 'Solana', basePrice: 185, volatility: 0.025 },
  'AAPL': { name: 'Apple Inc.', basePrice: 189, volatility: 0.008 },
  'TSLA': { name: 'Tesla Inc.', basePrice: 245, volatility: 0.022 },
  'MSFT': { name: 'Microsoft', basePrice: 415, volatility: 0.007 },
};

export const AVAILABLE_SYMBOLS = Object.keys(TICKER_CONFIG);

// In-memory state
const tickerState: Record<string, Ticker> = {};
const priceHistory: Record<string, PricePoint[]> = {};
const historyCache: Map<string, { data: PricePoint[]; cachedAt: number }> = new Map();
const CACHE_TTL_MS = 60_000; // 1 minute cache

function randomWalk(currentPrice: number, volatility: number): number {
  const change = currentPrice * volatility * (Math.random() - 0.5) * 2;
  return Math.max(currentPrice + change, 0.01);
}

function initTicker(symbol: string): Ticker {
  const config = TICKER_CONFIG[symbol];
  const price = config.basePrice * (1 + (Math.random() - 0.5) * 0.1);
  const change = price * (Math.random() - 0.5) * 0.06;
  return {
    symbol,
    name: config.name,
    price,
    change,
    changePercent: (change / price) * 100,
    volume: Math.floor(Math.random() * 1_000_000) + 100_000,
    high24h: price * (1 + Math.random() * 0.05),
    low24h: price * (1 - Math.random() * 0.05),
    lastUpdated: Date.now(),
  };
}

function generateHistoricalData(symbol: string, points = 100): PricePoint[] {
  const config = TICKER_CONFIG[symbol];
  const history: PricePoint[] = [];
  let price = config.basePrice * (1 - 0.05);
  const now = Date.now();
  const intervalMs = 5 * 60 * 1000; // 5 min candles

  for (let i = points; i >= 0; i--) {
    const open = price;
    const close = randomWalk(price, config.volatility * 0.5);
    const high = Math.max(open, close) * (1 + Math.random() * 0.005);
    const low = Math.min(open, close) * (1 - Math.random() * 0.005);
    history.push({
      timestamp: now - i * intervalMs,
      open,
      high,
      low,
      close,
      volume: Math.floor(Math.random() * 500_000) + 50_000,
    });
    price = close;
  }
  return history;
}

// Initialize state
for (const symbol of AVAILABLE_SYMBOLS) {
  tickerState[symbol] = initTicker(symbol);
  priceHistory[symbol] = generateHistoricalData(symbol);
}

export function getAllTickers(): Ticker[] {
  return Object.values(tickerState);
}

export function getTicker(symbol: string): Ticker | undefined {
  return tickerState[symbol];
}

export function getHistoricalData(symbol: string): PricePoint[] | null {
  if (!TICKER_CONFIG[symbol]) return null;

  // Return cached if fresh
  const cached = historyCache.get(symbol);
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
    return cached.data;
  }

  const data = priceHistory[symbol];
  historyCache.set(symbol, { data, cachedAt: Date.now() });
  return data;
}

export function updateTicker(symbol: string): Ticker {
  const config = TICKER_CONFIG[symbol];
  const current = tickerState[symbol];
  const newPrice = randomWalk(current.price, config.volatility * 0.3);
  const openPrice = priceHistory[symbol][0]?.open ?? newPrice;
  const change = newPrice - openPrice;

  const updated: Ticker = {
    ...current,
    price: newPrice,
    change,
    changePercent: (change / openPrice) * 100,
    volume: current.volume + Math.floor(Math.random() * 1000),
    high24h: Math.max(current.high24h, newPrice),
    low24h: Math.min(current.low24h, newPrice),
    lastUpdated: Date.now(),
  };

  tickerState[symbol] = updated;

  // Append a new price point to history (keep last 200)
  const lastCandle = priceHistory[symbol][priceHistory[symbol].length - 1];
  const now = Date.now();
  if (now - lastCandle.timestamp > 5 * 60 * 1000) {
    priceHistory[symbol].push({
      timestamp: now,
      open: lastCandle.close,
      high: newPrice,
      low: newPrice,
      close: newPrice,
      volume: Math.floor(Math.random() * 500_000),
    });
    if (priceHistory[symbol].length > 200) priceHistory[symbol].shift();
    // Invalidate cache
    historyCache.delete(symbol);
  } else {
    // Update last candle
    lastCandle.close = newPrice;
    lastCandle.high = Math.max(lastCandle.high, newPrice);
    lastCandle.low = Math.min(lastCandle.low, newPrice);
    lastCandle.volume += Math.floor(Math.random() * 1000);
    historyCache.delete(symbol);
  }

  return updated;
}
