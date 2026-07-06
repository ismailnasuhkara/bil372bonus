import { renderMessages } from "./message.js";

export function renderChannels() {
    const list = $('channelList');
    list.innerHTML = '';
    CHANNELS.forEach(ch => {
        const item = document.createElement('div');
        item.className = 'channel-item' + (currentChannel?.id === ch.id ? ' active' : '');
        item.innerHTML = `
        <div class="ch-icon">${ch.icon}</div>
        <div class="ch-info">
        <div class="ch-name">#${ch.name}</div>
        <div class="ch-last">${ch.desc}</div>
        </div>
        ${unread[ch.id] ? `<div class="ch-badge">${unread[ch.id]}</div>` : ''}
    `;
    item.onclick = () => joinChannel(ch);
    list.appendChild(item);
    });
}

export function joinChannel(ch) {
    currentChannel = ch;
    delete unread[ch.id];

    $('channelIcon').textContent = ch.icon;
    $('channelName').textContent = '#' + ch.name;
    $('channelMeta').textContent = ch.desc;
    $('msgInput').placeholder = `Message #${ch.name}…`;

    socket.emit('channel:join', ch.id);
    socket.emit('message:fetch_msg', { channelId: ch.id, limit: 50 });
    socket.emit('pins:fetch', { channelId: ch.id });

    renderChannels();
    renderMessages();
}