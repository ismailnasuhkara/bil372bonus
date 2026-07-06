import {
    pinMessage,
    unpinMessage,
    getPinnedMessages,
} from '../../services/pin.service.js';

export function registerPinHandlers(io, socket) {
    socket.on('message:pin', async ({ channelId, msgId }) => {
        await pinMessage(channelId, msgId);
        io.to(channelId).emit('message:pinned', { msgId });
    });

    socket.on('message:unpin', async ({ channelId, msgId }) => {
        await unpinMessage(channelId, msgId);
        io.to(channelId).emit('message:unpinned', { msgId });
    });

    socket.on('pins:fetch', async ({ channelId }) => {
        const pins = await getPinnedMessages(channelId);
        socket.emit('pins:list', { channelId, pins });
    });
}