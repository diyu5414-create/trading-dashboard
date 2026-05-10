import { useState, useEffect } from 'react';
import { PricePoint } from '../types';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

interface UsePriceHistoryReturn {
  data: PricePoint[];
  loading: boolean;
  error: string | null;
}

export function usePriceHistory(symbol: string): UsePriceHistoryReturn {
  const [data, setData] = useState<PricePoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`${API_BASE}/tickers/${symbol}/history`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<{ success: boolean; data: PricePoint[] }>;
      })
      .then((json) => {
        if (!cancelled) setData(json.data);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [symbol]);

  return { data, loading, error };
}
