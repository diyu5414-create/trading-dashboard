import { Router, Request, Response } from 'express';
import { getAllTickers, getTicker, getHistoricalData, AVAILABLE_SYMBOLS } from './marketData';

const router = Router();

// GET /api/tickers — list all available tickers with live prices
router.get('/tickers', (_req: Request, res: Response) => {
  res.json({ success: true, data: getAllTickers() });
});

// GET /api/tickers/:symbol — single ticker
router.get('/tickers/:symbol', (req: Request, res: Response) => {
  const { symbol } = req.params;
  const ticker = getTicker(symbol.toUpperCase());
  if (!ticker) {
    return res.status(404).json({ success: false, error: `Ticker ${symbol} not found` });
  }
  return res.json({ success: true, data: ticker });
});

// GET /api/tickers/:symbol/history — historical OHLCV data
router.get('/tickers/:symbol/history', (req: Request, res: Response) => {
  const { symbol } = req.params;
  const data = getHistoricalData(symbol.toUpperCase());
  if (!data) {
    return res.status(404).json({ success: false, error: `No history for ${symbol}` });
  }
  return res.json({ success: true, data, cached: true });
});

// GET /api/symbols — list available symbol names
router.get('/symbols', (_req: Request, res: Response) => {
  res.json({ success: true, data: AVAILABLE_SYMBOLS });
});

export default router;
