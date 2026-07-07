import { state, $ } from "./state.js";
import { 
    escapeHtml, 
    avatarColor, 
    formatTime,
    initialsFor 
} from "./format.js";


export function renderMessages() {
    const wrap = $('messagesWrap');
    wrap.innerHTML = '';
    const msgs = (state.channelMessages[state.currentChannel?.id] || []).slice().sort((a, b) => a.timestamp - b.timestamp);

    if (!msgs.length) {
    wrap.innerHTML = `<div class="msg-empty"><div class="msg-empty-icon">${state.currentChannel?.icon || '💬'}</div><p>No messages yet. Say hi!</p></div>`;
    return;
    }

    wrap.innerHTML = `<div class="date-divider">Today</div>`;
    msgs.forEach(m => wrap.appendChild(buildMessageRow(m)));
    wrap.scrollTop = wrap.scrollHeight;
}

export function sendMessage() {
    const input = $('msgInput');
    const text = input.value.trim();
    if (!text || !state.currentChannel) return;

    state.socket.emit('message:send', { channelId: state.currentChannel.id, text });

    input.value = '';
    input.style.height = 'auto';
}

export function renderPinned() {
    const list = $('pinnedList');
    list.innerHTML = '';
    if (!state.currentPins.length) {
        list.innerHTML = `<div class="pin-item" style="color:var(--text3);">No pinned messages yet.</div>`;
    } else {
        state.currentPins.forEach(p => {
            const el = document.createElement('div');
            el.className = 'pin-item';
            el.innerHTML = `<div class="pin-author">${escapeHtml(p.userId)}</div><div>${escapeHtml((p.text || '').slice(0, 60))}</div>`;
            list.appendChild(el);
        });
    }
    $('pinnedCount').textContent = state.currentPins.length;
    renderMessages();
}

export function togglePin(msgId, isPinned) {
    if (!state.currentChannel) return;
    state.socket.emit(isPinned ? 'message:unpin' : 'message:pin', { channelId: state.currentChannel.id, msgId });
}

export function toggleReaction(msgId, emoji) {
    state.socket.emit('message:react', { msgId, emoji });
}

export function openThread(msgId) {
    if (state.openThreads.has(msgId)) {
        state.openThreads.delete(msgId);
        renderMessages();
        return;
    }
    state.openThreads.add(msgId);
    state.socket.emit('thread:join', { parentId: msgId });
    state.socket.emit('thread:fetch', { msgId });
    renderMessages();
}

export function buildMessageRow(m) {
    const mine = m.userId === state.myUserId;
    const row = document.createElement('div');
    row.className = 'msg-row' + (mine ? ' mine' : '');

    const reactions = state.reactionsByMsg[m.id] || [];
    const reactionsHtml = reactions.map(r =>
    `<span class="reaction-pill" data-msg="${m.id}" data-emoji="${r.emoji}">${r.emoji} ${r.count}</span>`
    ).join('');

    const isPinned = state.currentPins.some(p => p.id === m.id) || m.pinned === '1';
    const replyCount = Number(m.replyCount || 0);
    const threadOpen = state.openThreads.has(m.id);

    let threadHtml = '';
    if (threadOpen) {
        const replies = state.threadReplies[m.id] || [];
        threadHtml = `
            <div class="thread-box">
            ${replies.length ? replies.map(r => `<div class="thread-reply"><b>${escapeHtml(r.userId)}:</b> ${escapeHtml(r.text)}</div>`).join('') : '<div class="thread-reply">No replies yet.</div>'}
            <div class="thread-input-row">
                <input type="text" placeholder="Reply…" data-reply-input="${m.id}" />
                <button class="msg-action-btn" data-reply-send="${m.id}">Send</button>
            </div>
            </div>
        `;
    }

    row.innerHTML = `
    <div class="msg-avatar" style="background:${avatarColor(m.userId)}">${initialsFor(m.userId)}</div>
    <div class="msg-content">
        <div class="msg-meta">
        <span class="msg-author">${escapeHtml(m.userId)}</span>
        <span class="msg-time">${formatTime(m.timestamp)}</span>
        </div>
        <div class="msg-bubble">${escapeHtml(m.text)}</div>
        <div class="msg-actions">
        <span class="msg-action-btn" data-react="${m.id}">👍 React</span>
        <span class="msg-action-btn ${isPinned ? 'pinned' : ''}" data-pin="${m.id}" data-pinned="${isPinned}">${isPinned ? '📌 Pinned' : '📌 Pin'}</span>
        <span class="msg-action-btn" data-thread="${m.id}">💬 ${replyCount ? replyCount + ' repl' + (replyCount === 1 ? 'y' : 'ies') : 'Reply'}</span>
        ${reactionsHtml}
        </div>
        ${threadHtml}
    </div>
    `;

    row.querySelector(`[data-react="${m.id}"]`).onclick = () => toggleReaction(m.id, '👍');
    row.querySelector(`[data-pin="${m.id}"]`).onclick = () => togglePin(m.id, isPinned);
    row.querySelector(`[data-thread="${m.id}"]`).onclick = () => openThread(m.id);
    row.querySelectorAll('.reaction-pill').forEach(el => {
        el.onclick = () => toggleReaction(el.dataset.msg, el.dataset.emoji);
    });
    const sendButton = row.querySelector(`[data-reply-send="${m.id}"]`);
    if (sendButton) {
        const doReply = () => {
            const input = row.querySelector(`[data-reply-input="${m.id}"]`);
            const text = input.value.trim();
            if (!text) return;
            state.socket.emit('reply:send', { parentId: m.id, text });
            input.value = '';
        };
        sendButton.onclick = doReply;
        row.querySelector(`[data-reply-input="${m.id}"]`).addEventListener('keydown', e => {
            if (e.key === 'Enter') doReply();
        });
    }

    return row;
}