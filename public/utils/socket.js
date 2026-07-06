import { renderChannels, joinChannel } from "./channel.js";
import { renderMessages, renderPinned } from "./message.js";

export function connectSocket(token) {
    socket = io({ auth: { token } });

    socket.on('connect', () => {
        $('connBadge').classList.remove('disconnected');
        $('connLabel').textContent = 'Live';
        renderChannels();
        joinChannel(CHANNELS[0]);
    });

    socket.on('disconnect', () => {
        $('connBadge').classList.add('disconnected');
        $('connLabel').textContent = 'Offline';
    });

    socket.on('connect_error', (err) => {
        $('connBadge').classList.add('disconnected');
        $('connLabel').textContent = 'Error';
        console.error('connect_error', err.message);
    });

    socket.on('error', (err) => console.error('[server error]', err));

    socket.on('message:new', (msg) => {
        (channelMessages[msg.channelId] ||= []).push(msg);
        if (msg.channelId === currentChannel?.id) {
            renderMessages();
        } else {
            unread[msg.channelId] = (unread[msg.channelId] || 0) + 1;
            renderChannels();
        }
    });

    socket.on('messages:list', ({ messages }) => {
        if (!currentChannel) return;
        // server returns newest-first; render oldest-first
        channelMessages[currentChannel.id] = [...messages].reverse();
        renderMessages();
    });

    socket.on('message:reactions', ({ msgId, reactions }) => {
        reactionsByMsg[msgId] = reactions;
        renderMessages();
    });

    socket.on('message:pinned', () => {
        if (currentChannel) socket.emit('pins:fetch', { channelId: currentChannel.id });
    });

    socket.on('message:unpinned', () => {
        if (currentChannel) socket.emit('pins:fetch', { channelId: currentChannel.id });
    });

    socket.on('pins:list', ({ channelId, pins }) => {
        if (channelId !== currentChannel?.id) return;
        currentPins = pins;
        renderPinned();
    });

    socket.on('thread:loaded', (thread) => {
        threadReplies[thread.parent.id] = thread.replies;
        renderMessages();
    });

    socket.on('thread:reply', (reply) => {
        (threadReplies[reply.replyTo] ||= []).push(reply);
        renderMessages();
    });

    socket.on('message:reply_count', ({ msgId, replyCount }) => {
        const list = channelMessages[currentChannel?.id] || [];
        const target = list.find(m => m.id === msgId);
        if (target) target.replyCount = replyCount;
        renderMessages();
    });
}