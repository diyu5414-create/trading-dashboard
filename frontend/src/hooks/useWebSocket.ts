import { useEffect, useRef, useCallback, useState } from 'react';
import { Ticker, WebSocketMessage, ConnectionStatus } from '../types';

const WS_URL = import.meta.env.VITE_WS_URL ?? 'ws://localhost:4001';
const RECONNECT_DELAY = 2000;
const MAX_RECONNECT = 5;

interface UseWebSocketReturn {
  tickers: Map<string, Ticker>;
  status: ConnectionStatus;
  subscribe: (symbol: string) => void;
  unsubscribe: (symbol: string) => void;
}

export function useWebSocket(): UseWebSocketReturn {
  const [tickers, setTickers] = useState<Map<string, Ticker>>(new Map());
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectCount = useRef(0);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const subscribedRef = useRef<Set<string>>(new Set());

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setStatus('connecting');
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus('connected');
      reconnectCount.current = 0;
      // Re-subscribe after reconnect
      subscribedRef.current.forEach((symbol) => {
        ws.send(JSON.stringify({ type: 'subscribe', symbol }));
      });
    };

    ws.onmessage = (event) => {
      try {
        const msg: WebSocketMessage = JSON.parse(event.data as string);
        if (msg.type === 'snapshot') {
          setTickers((prev) => {
            const next = new Map(prev);
            (msg.data as Ticker[]).forEach((t) => next.set(t.symbol, t));
            return next;
          });
        } else if (msg.type === 'ticker_update') {
          setTickers((prev) => {
            const next = new Map(prev);
            next.set(msg.symbol, msg.data as Ticker);
            return next;
          });
        }
      } catch {
        // ignore malformed messages
      }
    };

    ws.onclose = () => {
      setStatus('disconnected');
      if (reconnectCount.current < MAX_RECONNECT) {
        reconnectCount.current += 1;
        reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY);
      } else {
        setStatus('error');
      }
    };

    ws.onerror = () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      reconnectTimer.current && clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  const subscribe = useCallback((symbol: string) => {
    subscribedRef.current.add(symbol);
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'subscribe', symbol }));
    }
  }, []);

  const unsubscribe = useCallback((symbol: string) => {
    subscribedRef.current.delete(symbol);
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'unsubscribe', symbol }));
    }
  }, []);

  return { tickers, status, subscribe, unsubscribe };
}
