import { Ticker } from '../types';
import { formatPrice, formatVolume, formatChange } from '../utils/format';

interface Props {
  ticker: Ticker | null;
}

export function TickerDetail({ ticker }: Props) {
  if (!ticker) return null;
  const isPos = ticker.changePercent >= 0;

  return (
    <div className="ticker-detail">
      <div className="detail-header">
        <div>
          <h2 className="detail-symbol">{ticker.symbol}</h2>
          <p className="detail-name">{ticker.name}</p>
        </div>
        <div className="detail-price-block">
          <span className="detail-price">${formatPrice(ticker.price)}</span>
          <span className={`detail-change ${isPos ? 'pos' : 'neg'}`}>
            {isPos ? '▲' : '▼'} {formatChange(Math.abs(ticker.change), Math.abs(ticker.changePercent))}
          </span>
        </div>
      </div>
      <div className="detail-stats">
        <div className="stat">
          <span className="stat-label">24h High</span>
          <span className="stat-value">${formatPrice(ticker.high24h)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">24h Low</span>
          <span className="stat-value">${formatPrice(ticker.low24h)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Volume</span>
          <span className="stat-value">{formatVolume(ticker.volume)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Last Updated</span>
          <span className="stat-value">{new Date(ticker.lastUpdated).toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
}
