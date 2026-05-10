import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { PricePoint, Ticker } from '../types';
import { formatPrice, formatTime, formatVolume } from '../utils/format';

interface Props {
  history: PricePoint[];
  liveTicker: Ticker | null;
  loading: boolean;
}

interface ChartDatum {
  time: string;
  close: number;
  volume: number;
  open: number;
  high: number;
  low: number;
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: ChartDatum }[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="chart-tooltip">
      <p className="tt-time">{d.time}</p>
      <p>Open: <strong>${formatPrice(d.open)}</strong></p>
      <p>Close: <strong>${formatPrice(d.close)}</strong></p>
      <p>High: <strong>${formatPrice(d.high)}</strong></p>
      <p>Low: <strong>${formatPrice(d.low)}</strong></p>
      <p>Vol: <strong>{formatVolume(d.volume)}</strong></p>
    </div>
  );
}

export function PriceChart({ history, liveTicker, loading }: Props) {
  if (loading) {
    return (
      <div className="chart-placeholder">
        <div className="spinner" />
        <p>Loading historical data…</p>
      </div>
    );
  }

  const data: ChartDatum[] = history.map((p) => ({
    time: formatTime(p.timestamp),
    close: p.close,
    volume: p.volume,
    open: p.open,
    high: p.high,
    low: p.low,
  }));

  const prices = data.map((d) => d.close);
  const minPrice = Math.min(...prices) * 0.999;
  const maxPrice = Math.max(...prices) * 1.001;
  const isPositive = data.length > 1 && data[data.length - 1].close >= data[0].close;
  const lineColor = isPositive ? 'var(--green)' : 'var(--red)';

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={lineColor} stopOpacity={0.15} />
              <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="time"
            tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            yAxisId="price"
            domain={[minPrice, maxPrice]}
            tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => `$${formatPrice(v)}`}
            width={80}
          />
          <YAxis
            yAxisId="volume"
            orientation="right"
            tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => formatVolume(v)}
            width={55}
          />
          <Tooltip content={<CustomTooltip />} />
          {liveTicker && (
            <ReferenceLine
              yAxisId="price"
              y={liveTicker.price}
              stroke={lineColor}
              strokeDasharray="4 4"
              strokeWidth={1}
            />
          )}
          <Bar yAxisId="volume" dataKey="volume" fill="var(--bar-fill)" opacity={0.4} radius={[2, 2, 0, 0]} />
          <Line
            yAxisId="price"
            type="monotone"
            dataKey="close" 
            stroke={lineColor}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: lineColor }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
