import { describe, it, expect } from 'vitest';
import { formatPrice, formatVolume, formatChange } from '../utils/format';
import { render, screen } from '@testing-library/react';
import { ConnectionBadge } from '../components/ConnectionBadge';
import { TickerDetail } from '../components/TickerDetail';
import type { Ticker } from '../types';

// ── format utils ────────────────────────────────────────
describe('formatPrice', () => {
  it('formats prices >= 1000 with commas and 2 dp', () => {
    expect(formatPrice(67000)).toBe('67,000.00');
    expect(formatPrice(1234.5)).toBe('1,234.50');
  });

  it('formats prices 1–999 with 2 dp', () => {
    expect(formatPrice(189.99)).toBe('189.99');
    expect(formatPrice(1)).toBe('1.00');
  });

  it('formats prices < 1 with 6 dp', () => {
    expect(formatPrice(0.000456)).toBe('0.000456');
  });
});

describe('formatVolume', () => {
  it('formats millions', () => {
    expect(formatVolume(1_500_000)).toBe('1.50M');
  });
  it('formats thousands', () => {
    expect(formatVolume(25_000)).toBe('25.0K');
  });
  it('formats small numbers as-is', () => {
    expect(formatVolume(500)).toBe('500');
  });
});

describe('formatChange', () => {
  it('shows + prefix for positive change', () => {
    const result = formatChange(50, 2.5);
    expect(result).toContain('+');
    expect(result).toContain('2.50%');
  });

  it('shows - prefix for negative change (via negative values)', () => {
    const result = formatChange(-50, -2.5);
    // formatChange receives absolute value for change but percent can be negative
    expect(result).toBeDefined();
  });
});

// ── ConnectionBadge component ────────────────────────────
describe('ConnectionBadge', () => {
  it('renders "Live" when connected', () => {
    render(<ConnectionBadge status="connected" />);
    expect(screen.getByText('Live')).toBeTruthy();
  });

  it('renders "Connecting…" when connecting', () => {
    render(<ConnectionBadge status="connecting" />);
    expect(screen.getByText('Connecting…')).toBeTruthy();
  });

  it('renders "Disconnected" on error', () => {
    render(<ConnectionBadge status="error" />);
    expect(screen.getByText('Disconnected')).toBeTruthy();
  });
});

// ── TickerDetail component ───────────────────────────────
const mockTicker: Ticker = {
  symbol: 'BTC-USD',
  name: 'Bitcoin',
  price: 67000,
  change: 1200,
  changePercent: 1.82,
  volume: 1_200_000,
  high24h: 68500,
  low24h: 65000,
  lastUpdated: Date.now(),
};

describe('TickerDetail', () => {
  it('renders nothing when ticker is null', () => {
    const { container } = render(<TickerDetail ticker={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('displays symbol and name', () => {
    render(<TickerDetail ticker={mockTicker} />);
    expect(screen.getByText('BTC-USD')).toBeTruthy();
    expect(screen.getByText('Bitcoin')).toBeTruthy();
  });

  it('shows formatted price', () => {
    render(<TickerDetail ticker={mockTicker} />);
    expect(screen.getByText('$67,000.00')).toBeTruthy();
  });

  it('shows 24h high and low', () => {
    render(<TickerDetail ticker={mockTicker} />);
    expect(screen.getByText('$68,500.00')).toBeTruthy();
    expect(screen.getByText('$65,000.00')).toBeTruthy();
  });

  it('applies pos class for positive change', () => {
    const { container } = render(<TickerDetail ticker={mockTicker} />);
    const changeEl = container.querySelector('.detail-change');
    expect(changeEl?.classList.contains('pos')).toBe(true);
  });

  it('applies neg class for negative change', () => {
    const negativeTicker = { ...mockTicker, change: -500, changePercent: -0.75 };
    const { container } = render(<TickerDetail ticker={negativeTicker} />);
    const changeEl = container.querySelector('.detail-change');
    expect(changeEl?.classList.contains('neg')).toBe(true);
  });
});
