import { Ticker } from '../types';
import { formatPrice, formatVolume } from '../utils/format';

interface Props {
  tickers: Ticker[];
  selected: string | null;
  onSelect: (symbol: string) => void;
  flashMap: Map<string, 'up' | 'down'>;
}

export function TickerList({ tickers, selected, onSelect, flashMap }: Props) {
  return (
    <div className="ticker-list">
      <div className="ticker-list-header">
        <span>Asset</span>
        <span>Price</span>
        <span>24h Change</span>
        <span>Volume</span>
      </div>
      {tickers.map((t) => {
        const flash = flashMap.get(t.symbol);
        const isPos = t.changePercent >= 0;
        return (
          <button
            key={t.symbol}
            className={`ticker-row ${selected === t.symbol ? 'active' : ''} ${flash ? `flash-${flash}` : ''}`}
            onClick={() => onSelect(t.symbol)}
          >
            <span className="ticker-identity">
              <span className="ticker-symbol">{t.symbol}</span>
              <span className="ticker-name">{t.name}</span>
            </span>
            <span className="ticker-price">${formatPrice(t.price)}</span>
            <span className={`ticker-change ${isPos ? 'pos' : 'neg'}`}>
              {isPos ? '▲' : '▼'} {Math.abs(t.changePercent).toFixed(2)}%
            </span>
            <span className="ticker-vol">{formatVolume(t.volume)}</span>
          </button>
        );
      })}
    </div>
  );
}
