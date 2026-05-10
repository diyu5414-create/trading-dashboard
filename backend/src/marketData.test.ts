import {
  getAllTickers,
  getTicker,
  getHistoricalData,
  updateTicker,
  AVAILABLE_SYMBOLS,
} from '../src/marketData';

describe('marketData', () => {
  describe('AVAILABLE_SYMBOLS', () => {
    it('should have at least 6 symbols', () => {
      expect(AVAILABLE_SYMBOLS.length).toBeGreaterThanOrEqual(6);
    });

    it('should include BTC-USD and AAPL', () => {
      expect(AVAILABLE_SYMBOLS).toContain('BTC-USD');
      expect(AVAILABLE_SYMBOLS).toContain('AAPL');
    });
  });

  describe('getAllTickers()', () => {
    it('returns an array with length equal to AVAILABLE_SYMBOLS', () => {
      const tickers = getAllTickers();
      expect(tickers.length).toBe(AVAILABLE_SYMBOLS.length);
    });

    it('each ticker has required fields', () => {
      const tickers = getAllTickers();
      for (const t of tickers) {
        expect(t).toHaveProperty('symbol');
        expect(t).toHaveProperty('name');
        expect(t).toHaveProperty('price');
        expect(t).toHaveProperty('change');
        expect(t).toHaveProperty('changePercent');
        expect(t).toHaveProperty('volume');
        expect(t).toHaveProperty('high24h');
        expect(t).toHaveProperty('low24h');
        expect(t).toHaveProperty('lastUpdated');
        expect(t.price).toBeGreaterThan(0);
        expect(t.volume).toBeGreaterThan(0);
      }
    });
  });

  describe('getTicker()', () => {
    it('returns ticker for known symbol', () => {
      const t = getTicker('BTC-USD');
      expect(t).toBeDefined();
      expect(t?.symbol).toBe('BTC-USD');
    });

    it('returns undefined for unknown symbol', () => {
      expect(getTicker('FAKE-XYZ')).toBeUndefined();
    });
  });

  describe('getHistoricalData()', () => {
    it('returns array of price points for valid symbol', () => {
      const data = getHistoricalData('ETH-USD');
      expect(Array.isArray(data)).toBe(true);
      expect(data!.length).toBeGreaterThan(0);
    });

    it('each price point has OHLCV fields', () => {
      const data = getHistoricalData('BTC-USD')!;
      for (const p of data) {
        expect(p).toHaveProperty('timestamp');
        expect(p).toHaveProperty('open');
        expect(p).toHaveProperty('high');
        expect(p).toHaveProperty('low');
        expect(p).toHaveProperty('close');
        expect(p).toHaveProperty('volume');
        expect(p.high).toBeGreaterThanOrEqual(p.low);
        expect(p.open).toBeGreaterThan(0);
      }
    });

    it('returns null for invalid symbol', () => {
      expect(getHistoricalData('FAKE-XYZ')).toBeNull();
    });

    it('uses cache on second call', () => {
      const first = getHistoricalData('TSLA');
      const second = getHistoricalData('TSLA');
      expect(first).toBe(second); // same reference = cache hit
    });
  });

  describe('updateTicker()', () => {
    it('returns updated ticker with new timestamp', () => {
      const before = getTicker('SOL-USD')!;
      const updated = updateTicker('SOL-USD');
      expect(updated.lastUpdated).toBeGreaterThanOrEqual(before.lastUpdated);
      expect(updated.symbol).toBe('SOL-USD');
      expect(updated.price).toBeGreaterThan(0);
    });

    it('high24h is always >= price', () => {
      for (let i = 0; i < 5; i++) updateTicker('MSFT');
      const t = getTicker('MSFT')!;
      expect(t.high24h).toBeGreaterThanOrEqual(t.price - 0.001); // float tolerance
    });

    it('low24h is always <= price', () => {
      for (let i = 0; i < 5; i++) updateTicker('AAPL');
      const t = getTicker('AAPL')!;
      expect(t.low24h).toBeLessThanOrEqual(t.price + 0.001);
    });
  });
});
