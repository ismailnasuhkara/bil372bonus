import { config } from './config.js';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import path from 'path';
import { initSocket } from './socket/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: config.server.clientUrl } });

initSocket(io);
httpServer.listen(config.server.port ?? 3000, () => {
    console.log(`[redis] Server listening on port ${config.server.port ?? 3000}`);
});