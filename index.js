import { config } from './config.js';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import path from 'path';
import jwt from 'jsonwebtoken';
import { initSocket } from './socket/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.post('/api/token', (req, res) => {
    const username = (req.body?.username || '').trim();
    if (!username) return res.status(400).json({ error: 'username is required '});

    const token = jwt.sign(
        { sub: username, username, roles: [] },
        config.auth.jwtSecret,
        { expiresIn: config.auth.jwtExpiresIn }
    );
    res.join({ token, userId: username });
})

const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: config.server.clientUrl } });

initSocket(io);
httpServer.listen(config.server.port ?? 3000, () => {
    console.log(`[redis] Server listening on port ${config.server.port ?? 3000}`);
});