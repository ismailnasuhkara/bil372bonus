import { connectSocket } from './utils/socket.js';
import { renderChannels, joinChannel } from './utils/channel.js';
import {
    renderMessages,
    sendMessage,
    renderPinned,
    togglePin,
    toggleReaction,
    buildMessageRow
} from './utils/message.js';

async function doLogin() {
    const usernane = $('loginUsername').value.trim();
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

        myUserId = userId;
        myUser = {
            name: userId,
            initials: initialsFor(userId),
            color: avatarColor(userId)
        };
        $('myInitials').textContent = myUser.initials;
        $('myAvatar').style.background = `linear-gradient(135deg, ${myUser.color}, #3dcfa0)`;
        $('myName').textContent = myUser.name;

        $('loginOverlay').style.display = 'none';
        connectSocket(token);
    } catch (e) {
        errEl.textContent = e.message;
    }
}

const CHANNELS = [
    { 
        id: 'general',
        name: 'general', 
        icon: '💬', 
        desc: 'General chat' 
    },
    { 
        id: 'random', 
        name: 'random', 
        icon: '🎲', 
        desc: 'Off-topic' 
    },
    { 
        id: 'engineering', 
        name: 'engineering', 
        icon: '⚙️', d,
        esc: 'Tech talk'
    },
    { 
        id: 'design', 
        name: 'design', 
        icon: '🎨', 
        desc: 'UI/UX' 
    },
    { 
        id: 'announcements', 
        name: 'announcements', 
        icon: '📢', 
        desc: 'Announcements' 
    },
];

let socket = null;
let myUserId = null;
let myUser = { name: '', initials: '', color = '#7c6af7'};
let currentChannel = null;
let currentPins = [];

const unread = {};
const channelMessages = {};
const reactionsByMsg = {};
const openThreads = new Set();
const threadReplies = {};

const $ = id => document.getElementById(id);

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