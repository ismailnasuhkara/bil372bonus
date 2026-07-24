import { renderChannels, joinChannel } from "./channel.js";
import { renderMessages, renderPinned } from "./message.js";
import { state, $ } from "./state.js";

export function connectSocket(token) {
    state.socket = io({ auth: { token } });

    state.socket.on('connect', () => {
        $('connBadge').classList.remove('disconnected');
        $('connLabel').textContent = 'Online';
        renderChannels();
        joinChannel(state.CHANNELS[0]);
    });

    state.socket.on('disconnect', () => {
        $('connBadge').classList.add('disconnected');
        $('connLabel').textContent = 'Offline';
    });

    state.socket.on('connect_error', (err) => {
        $('connBadge').classList.add('disconnected');
        $('connLabel').textContent = 'Error';
        console.error('connect_error', err.message);
    });

    state.socket.on('error', (err) => console.error('[server error]', err));

    state.socket.on('message:new', (msg) => {
        (state.channelMessages[msg.channelId] ||= []).push(msg);
        if (msg.channelId === state.currentChannel?.id) {
            renderMessages();
        } else {
            state.unread[msg.channelId] = (state.unread[msg.channelId] || 0) + 1;
            renderChannels();
        }
    });

    state.socket.on('message:list', ({ messages }) => {
        if (!state.currentChannel) return;
        // server returns newest-first; render oldest-first
        state.channelMessages[state.currentChannel.id] = [...messages].reverse();
        renderMessages();
    });

    state.socket.on('message:reactions', ({ msgId, reactions }) => {
        state.reactionsByMsg[msgId] = reactions;
        renderMessages();
    });

    state.socket.on('message:pinned', () => {
        if (state.currentChannel) state.socket.emit('pins:fetch', { channelId: state.currentChannel.id });
    });

    state.socket.on('message:unpinned', () => {
        if (state.currentChannel) state.socket.emit('pins:fetch', { channelId: state.currentChannel.id });
    });

    state.socket.on('pins:list', ({ channelId, pins }) => {
        if (channelId !== state.currentChannel?.id) 
            return;
        state.currentPins = pins;
        renderPinned();
    });

    state.socket.on('thread:loaded', (thread) => {
        state.threadReplies[thread.parent.id] = thread.replies;
        renderMessages();
    });

    state.socket.on('thread:reply', (reply) => {
        (state.threadReplies[reply.replyTo] ||= []).push(reply);
        renderMessages();
    });

    state.socket.on('message:reply_count', ({ msgId, replyCount }) => {
        const list = state.channelMessages[state.currentChannel?.id] || [];
        const target = list.find(m => m.id === msgId);
        if (target) target.replyCount = replyCount;
        renderMessages();
    });

    state.socket.on('message:deleted', ({ msgId }) => {
        for (const channelId in state.channelMessages) {
            state.channelMessages[channelId] = state.channelMessages[channelId].filter(m => m.id !== msgId);
        }
        for (const parentId in state.threadReplies) {
            state.threadReplies[parentId] = state.threadReplies[parentId].filter(r => r.id !== msgId);
        }
        state.currentPins = state.currentPins.filter(p => p.id !== msgId);

        renderMessages();
        renderPinned();
    });

    state.socket.on('data:purged', () => {
        state.channelMessages = {};
        state.threadReplies = {};
        state.reactionsByMsg = {};
        state.currentPins = [];
        state.openThreads.clear();
        state.unread = {};

        renderMessages();
        renderPinned();
        renderChannels();
    });
}