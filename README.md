# Real-Time Trading Dashboard

## Why I Built This

I built this project to practice real-time trading dashboards using React,
WebSockets, and backend API integration.

A full-stack real-time cryptocurrency and stock trading dashboard built with React + TypeScript (frontend) and Node.js + TypeScript (backend).

---

## Project Overview

NexusTrade streams live simulated price data for 6 financial instruments (BTC-USD, ETH-USD, SOL-USD, AAPL, TSLA, MSFT) via WebSocket and serves historical OHLCV data via a RESTful API. The frontend renders live-updating ticker cards, interactive Recharts price charts, and a price alert system.

### Features
- **Live ticker list** with real-time price updates and flash animations (green/red) on price changes
- **Interactive price chart** (line + volume bars) with historical OHLCV data
- **WebSocket streaming** with automatic reconnection (up to 5 retries)
- **Price alerts** — set above/below thresholds with triggered notifications
- **Mock authentication** (JWT-free session-based, three demo users)
- **Historical data caching** — 1-minute in-memory TTL cache on the backend
- **Docker** — multi-stage builds for both services, docker-compose orchestration
- **Unit tests** — backend (Jest) and frontend (Vitest + React Testing Library)

---

## Architecture

```
trading-dashboard/
├── backend/          # Node.js + Express + ws
│   └── src/
│       ├── index.ts        # Entry: HTTP + WS servers
│       ├── routes.ts       # REST API routes
│       ├── websocket.ts    # WebSocket server + broadcast loop
│       ├── marketData.ts   # Price simulation, cache, state
│       └── types.ts
├── frontend/         # React 18 + TypeScript + Recharts
│   └── src/
│       ├── components/     # Dashboard, TickerList, PriceChart, Alerts…
│       ├── hooks/          # useWebSocket, usePriceHistory, useAlerts
│       ├── context/        # AuthContext (mock login)
│       ├── utils/          # formatPrice, formatVolume…
│       └── types/
├── docker-compose.yml
└── README.md
```

### API Design
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/symbols` | List available symbols |
| GET | `/api/tickers` | All tickers with live prices |
| GET | `/api/tickers/:symbol` | Single ticker |
| GET | `/api/tickers/:symbol/history` | Historical OHLCV (cached) |
| GET | `/health` | Health check |

### WebSocket Protocol
Connect to `ws://localhost:4001`

**Client → Server**
```json
{ "type": "subscribe",   "symbol": "BTC-USD" }
{ "type": "unsubscribe", "symbol": "BTC-USD" }
```

**Server → Client**
```json
{ "type": "snapshot",      "data": [Ticker[]] }
{ "type": "ticker_update", "symbol": "BTC-USD", "data": Ticker }
{ "type": "subscribed",    "symbol": "BTC-USD" }
```

---

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- (Optional) Docker + Docker Compose

### Local development

```bash
# 1. Install backend deps & start
cd backend
npm install
npm run dev          # starts HTTP :4000 + WS :4001

# 2. In another terminal, install frontend deps & start
cd ../frontend
npm install
cp .env.example .env
npm run dev          # starts Vite dev server :3000
```

Open [http://localhost:3000](http://localhost:3000)

**Demo credentials**
| Username | Password | Role |
|----------|----------|------|
| `demo`   | `demo`   | trader |
| `trader` | `trade123` | trader |
| `viewer` | `view123`  | viewer |

### Docker

```bash
# From project root
docker-compose up --build
```

Frontend → http://localhost:3000  
Backend API → http://localhost:4000/api  
WebSocket → ws://localhost:4001

---

## Running Tests

### Backend (Jest)
```bash
cd backend
npm install
npm test             # runs with coverage
```

### Frontend (Vitest)
```bash
cd frontend
npm install
npm test             # single run
npm run test:watch   # watch mode
```

---

## Assumptions & Trade-offs

- **Simulated data** — prices use a random-walk model with per-ticker volatility. No external API keys required.
- **In-memory state** — all ticker state and price history live in process memory. A production version would use Redis or a time-series DB.
- **Mock auth** — credentials are hardcoded. Production would use JWT + a real user store.
- **No persistent alerts** — alerts reset on page reload. Could be persisted to localStorage or a backend store.
- **WebSocket port** — uses a separate port (4001) to keep HTTP and WS concerns independent, which is easier to scale independently.
- **Cache TTL** — historical data is cached for 60 seconds. In production this would be configurable and backed by Redis.

---

## Bonus Features Implemented

- ✅ Mock authentication (session-based with 3 demo users)
- ✅ Caching for historical data (1-min TTL in-memory cache)
- ✅ Price threshold alerts (above/below with triggered notifications)
- ✅ Docker containerisation (multi-stage builds + docker-compose)

  ## Known Issues

- WebSocket reconnect logic needs improvement
- Large datasets can slow chart rendering
- Authentication flow is basic right now
