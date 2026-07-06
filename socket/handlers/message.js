import { sendMessage, getMessages } from '../../services/message.service.js';

export function registerMessageHandlers(io, socket) {
    socket.on('message:send', async ({ channelId, text, replyTo }) => {
        const msg = await sendMessage({ channelId, userId: socket.user.id, text, replyTo });
        io.to(channelId).emit('message:new', msg)
    });

    socket.on('message:fetch_msg', async ({ channelId, before, limit }) => {
        const msg = await getMessages(channelId, { before, limit });
        socket.emit('messages:list', messages);
    })
}