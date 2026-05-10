import express from 'express';
import cors from 'cors';
import routes from './routes';
import { createWebSocketServer } from './websocket';

const HTTP_PORT = Number(process.env.PORT ?? 4000);
const WS_PORT = Number(process.env.WS_PORT ?? 4001);

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', routes);

app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: Date.now() }));

app.listen(HTTP_PORT, () => {
  console.log(`🚀 REST API running on http://localhost:${HTTP_PORT}`);
});

createWebSocketServer(WS_PORT);
console.log(`⚡ WebSocket server running on ws://localhost:${WS_PORT}`);
