import {
    toggleReaction,
    getReactions,
    getUsersWhoReacted,
} from '../../services/reaction.service.js';

export function registerReactionHandlers(io, socket) {
    socket.on('message:react', async ({ msgId, emoji }) => {
        const { channelId, reactions, action } = await toggleReaction(msgId, emoji, socket.user.id);
        io.to(msg.channelId).emit('message:reactions', { msgId, reactions, action });
    });

    socket.on('message:fetch_react', async ({ msgId }) => {
        const reactions = await getReactions(msgId);
        socket.emit('reactions:list', { msgId, reactions });
    });

    socket.on('reactions:who', async ({ msgId, emoji }) => {
        const users = await getUsersWhoReacted(msgId, emoji);
        socket.emit('reactions:users', { msgId, emoji, users });
    });
}