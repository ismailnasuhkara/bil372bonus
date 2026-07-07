import { connectSocket } from './utils/socket.js';
import { renderChannels, joinChannel } from './utils/channel.js';
import { avatarColor, initialsFor } from "./utils/format.js";
import { state, $ } from './utils/state.js';
import {
    renderMessages,
    sendMessage,
    renderPinned,
    togglePin,
    toggleReaction,
    buildMessageRow
} from './utils/message.js';

async function doLogin() {
    const username = $('loginUsername').value.trim();
    const errEl = $('loginError');
    errEl.textContent = '';
    if (!username) {
        errEl.textContent = 'Enter a username.';
        return;
    }

    try {
        const res = await fetch('/api/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username })
        });
        if (!res.ok)
            throw new Error((await res.json().error || 'Login Failed'));
        const { token, userId } = await res.json();

        state.myUserId = userId;
        state.myUser = {
            name: userId,
            initials: initialsFor(userId),
            color: avatarColor(userId)
        };
        $('myInitials').textContent = state.myUser.initials;
        $('myAvatar').style.background = `linear-gradient(135deg, ${state.myUser.color}, #3dcfa0)`;
        $('myName').textContent = state.myUser.name;
        $('loginOverlay').style.display = 'none';

        connectSocket(token);
    } catch (e) {
        errEl.textContent = e.message;
    }
}

$('loginButton').addEventListener('click', doLogin);
$('loginUsername').addEventListener('keydown', e => {
    if (e.key === 'Enter')
        doLogin();
});

$('msgInput').addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 140) + 'px';
});

$('msgInput').addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

$('sendButton').addEventListener('click', sendMessage);