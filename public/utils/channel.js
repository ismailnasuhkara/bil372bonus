import { renderMessages } from "./message.js";
import { state, $ } from "./state.js";

export function renderChannels() {
    const list = $('channelList');
    list.innerHTML = '';
    state.CHANNELS.forEach(ch => {
        const item = document.createElement('div');
        item.className = 'channel-item' + (state.currentChannel?.id === ch.id ? ' active' : '');
        item.innerHTML = `
        <div class="ch-icon">${ch.icon}</div>
        <div class="ch-info">
        <div class="ch-name">#${ch.name}</div>
        <div class="ch-last">${ch.desc}</div>
        </div>
        ${unread[ch.id] ? `<div class="ch-badge">${state.unread[ch.id]}</div>` : ''}
    `;
    item.onclick = () => joinChannel(ch);
    list.appendChild(item);
    });
}

export function joinChannel(ch) {
    state.currentChannel = ch;
    delete state.unread[ch.id];

    $('channelIcon').textContent = ch.icon;
    $('channelName').textContent = '#' + ch.name;
    $('channelMeta').textContent = ch.desc;
    $('msgInput').placeholder = `Message #${ch.name}…`;

    state.socket.emit('channel:join', ch.id);
    state.socket.emit('message:fetch_msg', { channelId: ch.id, limit: 50 });
    state.socket.emit('pins:fetch', { channelId: ch.id });

    renderChannels();
    renderMessages();
}