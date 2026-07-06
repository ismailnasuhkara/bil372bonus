import { authMiddleware } from './middleware/auth.js';
import { registerMessageHandlers } from './handlers/message.js';
import { registerReactionHandlers } from './handlers/reaction.js';
import { registerPinHandlers } from './handlers/pin.js';
import { registerThreadHandlers } from './handlers/thread.js';

export function initSocket(io) {
    io.use(authMiddleware);

    io.on('connection', (socket) => {
        socket.on('channel:join', (channelId) => socket.join(channelId));
        socket.on('channel:leave', (channelId) => socket.leave(channelId));

        registerMessageHandlers(io, socket);
        registerReactionHandlers(io, socket);
        registerPinHandlers(io, socket);
        registerThreadHandlers(io, socket);
    });
}