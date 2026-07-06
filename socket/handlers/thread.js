import {
    getThread,
    sendReply,
} from '../../services//thread.service.js';

export function registerThreadHandlers(io, socket) {
    socket.on('thread:fetch', async ({ msgId }) => {
        const thread = await getThread(msgId);
        socket.emit('thread:loaded', thread);
    });

    socket.on('reply:send', async ({ parentId, text }) => {
        const { reply, replyCount } = await sendReply({
            parentId,
            userId: socket.user.id,
            text
        })
        io.to(`thread:${parentId}`).emit('thread:reply', reply);

        const channelId = reply.channelId;
        io.to(channelId).emit('message:reply_count', { msgId: parentId, replyCount });
    });

    socket.on('thread:join', ({ parentId }) => socket.join(`thread:${parentId}`));
    socket.on('thread:leave', ({ parentId }) => socket.leave(`thread:${parentId}`));
}