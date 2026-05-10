import { useState, useEffect, useRef } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { usePriceHistory } from '../hooks/usePriceHistory';
import { useAlerts } from '../hooks/useAlerts';
import { useAuth } from '../context/AuthContext';
import { TickerList } from './TickerList';
import { PriceChart } from './PriceChart';
import { TickerDetail } from './TickerDetail';
import { AlertsPanel } from './AlertsPanel';
import { ConnectionBadge } from './ConnectionBadge';
import { Ticker } from '../types';

export function Dashboard() {
  const { user, logout } = useAuth();
  const { tickers, status } = useWebSocket();
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>('BTC-USD');
  const [showAlerts, setShowAlerts] = useState(false);
  const { data: history, loading: histLoading } = usePriceHistory(selectedSymbol ?? '');
  const { alerts, triggered, addAlert, removeAlert, clearTriggered } = useAlerts(tickers);

  // Flash animation tracking
  const [flashMap, setFlashMap] = useState<Map<string, 'up' | 'down'>>(new Map());
  const prevPricesRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    const newFlash = new Map<string, 'up' | 'down'>();
    let changed = false;

    tickers.forEach((t, sym) => {
      const prev = prevPricesRef.current.get(sym);
      if (prev !== undefined && prev !== t.price) {
        newFlash.set(sym, t.price > prev ? 'up' : 'down');
        changed = true;
      }
      prevPricesRef.current.set(sym, t.price);
    });

    if (changed) {
      setFlashMap(newFlash);
      const timer = setTimeout(() => setFlashMap(new Map()), 600);
      return () => clearTimeout(timer);
    }
  }, [tickers]);

  const tickerList: Ticker[] = Array.from(tickers.values()).sort((a, b) =>
    a.symbol.localeCompare(b.symbol)
  );

  const selectedTicker = selectedSymbol ? tickers.get(selectedSymbol) ?? null : null;
  const triggeredCount = triggered.length;

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dash-header">
        <div className="dash-logo">
          <span className="logo-mark">◈</span>
          <span className="logo-text">NEXUS<strong>TRADE</strong></span>
        </div>
        <div className="dash-header-right">
          <ConnectionBadge status={status} />
          <button
            className={`alerts-toggle ${triggeredCount > 0 ? 'has-alerts' : ''}`}
            onClick={() => setShowAlerts((v) => !v)}
          >
            🔔  Alerts {triggeredCount > 0 && <span className="badge">{triggeredCount}</span>}
          </button>
          <span className="dash-user">
            {user?.username}
            <span className="user-role">{user?.role}</span>
          </span>
          <button className="logout-btn" onClick={logout}>Sign out</button>
        </div>
      </header>

      {/* Main layout */}
      <main className="dash-main">
        {/* Left: ticker list */}
        <aside className="dash-sidebar">
          <TickerList
            tickers={tickerList}
            selected={selectedSymbol}
            onSelect={setSelectedSymbol}
            flashMap={flashMap}
          />
        </aside>

        {/* Centre: chart + stats */}
        <section className="dash-center">
          <TickerDetail ticker={selectedTicker} />
          <PriceChart
            history={history}
            liveTicker={selectedTicker}
            loading={histLoading}
          />
        </section>

        {/* Right: alerts panel (collapsible) */}
        {showAlerts && (
          <aside className="dash-alerts">
            <AlertsPanel
              alerts={alerts}
              triggered={triggered}
              tickers={tickers}
              selectedSymbol={selectedSymbol}
              onAdd={addAlert}
              onRemove={removeAlert}
              onClearTriggered={clearTriggered}
            />
          </aside>
        )}
      </main>
    </div>
  );
}
