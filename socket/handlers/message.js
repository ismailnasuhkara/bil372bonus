import { sendMessage, getMessages, deleteMessage } from '../../services/message.service.js';

export function registerMessageHandlers(io, socket) {
    socket.on('message:send', async ({ channelId, text, replyTo }) => {
        const msg = await sendMessage({ channelId, userId: socket.user.id, text, replyTo });
        io.to(channelId).emit('message:new', msg)
    });

    socket.on('message:fetch_msg', async ({ channelId, before, limit }) => {
        const msg = await getMessages(channelId, { before, limit });
        socket.emit('message:list', msg);
    })

    socket.on('message:delete', async ({ msgId }) => {
        const { channelId, replyTo } = await deleteMessage(msgId);
        io.to(channelId).emit('message:deleted', { msgId });
        if (replyTo) {
            io.to(`thread:${replyTo}`).emit('message:deleted', { msgId });
        }
    });
}