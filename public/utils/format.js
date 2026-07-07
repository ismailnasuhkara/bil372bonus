export function avatarColor(name) {
    const colors = [
        '#7c6af7',
        '#3dcfa0',
        '#f05c7a', 
        '#f0a84b', 
        '#a78bfa', 
        '#34d399', 
        '#60a5fa', 
        '#fb7185'
    ];

    let h = 0;
    for (const c of String(name))
        h = (h * 31 + c.charCodeAt(0)) & 0xffff;
    return colors[h % colors.length];
}

export function initialsFor(name) {
    return String(name).slice(0,2).toUpperCase();
}

export function formatTime(ts) {
    return new Date(Number(ts)).toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
}

export function escapeHtml(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}