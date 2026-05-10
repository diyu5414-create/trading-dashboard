import { useState, FormEvent } from 'react';
import { Alert, Ticker } from '../types';
import { formatPrice } from '../utils/format';

interface Props {
  alerts: Alert[];
  triggered: Alert[];
  tickers: Map<string, Ticker>;
  selectedSymbol: string | null;
  onAdd: (symbol: string, price: number, direction: 'above' | 'below') => void;
  onRemove: (id: string) => void;
  onClearTriggered: () => void;
}

export function AlertsPanel({
  alerts,
  triggered,
  tickers,
  selectedSymbol,
  onAdd,
  onRemove,
  onClearTriggered,
}: Props) {
  const [symbol, setSymbol] = useState(selectedSymbol ?? '');
  const [price, setPrice] = useState('');
  const [direction, setDirection] = useState<'above' | 'below'>('above');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const p = parseFloat(price);
    if (!symbol || isNaN(p) || p <= 0) return;
    onAdd(symbol, p, direction);
    setPrice('');
  };

  const symbols = Array.from(tickers.keys());
  const active = alerts.filter((a) => !a.triggered);

  return (
    <div className="alerts-panel">
      <h3 className="panel-title">Price Alerts</h3>

      <form className="alert-form" onSubmit={handleSubmit}>
        <select value={symbol} onChange={(e) => setSymbol(e.target.value)} required>
          <option value="">Select symbol…</option>
          {symbols.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <div className="alert-form-row">
          <select value={direction} onChange={(e) => setDirection(e.target.value as 'above' | 'below')}>
            <option value="above">Above</option>
            <option value="below">Below</option>
          </select>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Target price"
            step="any"
            min="0"
            required
          />
        </div>
        <button type="submit" className="alert-add-btn">+ Set Alert</button>
      </form>

      {triggered.length > 0 && (
        <div className="alerts-triggered">
          <div className="alerts-section-header">
            <span>🔔 Triggered ({triggered.length})</span>
            <button onClick={onClearTriggered} className="clear-btn">Clear</button>
          </div>
          {triggered.map((a) => (
            <div key={a.id} className="alert-item triggered">
              <span className="alert-symbol">{a.symbol}</span>
              <span>{a.direction === 'above' ? '≥' : '≤'} ${formatPrice(a.targetPrice)}</span>
            </div>
          ))}
        </div>
      )}

      <div className="alerts-active">
        <p className="alerts-section-header">
          <span>Active ({active.length})</span>
        </p>
        {active.length === 0 && <p className="empty-msg">No active alerts</p>}
        {active.map((a) => {
          const ticker = tickers.get(a.symbol);
          return (
            <div key={a.id} className="alert-item">
              <span className="alert-symbol">{a.symbol}</span>
              <span>{a.direction === 'above' ? '≥' : '≤'} ${formatPrice(a.targetPrice)}</span>
              {ticker && (
                <span className="alert-current">now ${formatPrice(ticker.price)}</span>
              )}
              <button className="remove-btn" onClick={() => onRemove(a.id)}>✕</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
