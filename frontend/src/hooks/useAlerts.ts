import { useState, useEffect, useRef } from 'react';
import { Alert, Ticker } from '../types';

export function useAlerts(tickers: Map<string, Ticker>) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [triggered, setTriggered] = useState<Alert[]>([]);
  const prevTickersRef = useRef<Map<string, Ticker>>(new Map());

  // Check alerts when tickers update
  useEffect(() => {
    const newlyTriggered: Alert[] = [];

    setAlerts((current) =>
      current.map((alert) => {
        if (alert.triggered) return alert;
        const ticker = tickers.get(alert.symbol);
        if (!ticker) return alert;

        const hit =
          (alert.direction === 'above' && ticker.price >= alert.targetPrice) ||
          (alert.direction === 'below' && ticker.price <= alert.targetPrice);

        if (hit) {
          const updated = { ...alert, triggered: true };
          newlyTriggered.push(updated);
          return updated;
        }
        return alert;
      })
    );

    if (newlyTriggered.length > 0) {
      setTriggered((prev) => [...newlyTriggered, ...prev].slice(0, 20));
    }

    prevTickersRef.current = tickers;
  }, [tickers]);

  const addAlert = (symbol: string, targetPrice: number, direction: 'above' | 'below') => {
    const alert: Alert = {
      id: `${symbol}-${Date.now()}`,
      symbol,
      targetPrice,
      direction,
      triggered: false,
      createdAt: Date.now(),
    };
    setAlerts((prev) => [alert, ...prev]);
  };

  const removeAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const clearTriggered = () => setTriggered([]);

  return { alerts, triggered, addAlert, removeAlert, clearTriggered };
}
