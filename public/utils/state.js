export const state = {
    CHANNELS: [
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
            icon: '⚙️',
            desc: 'Tech talk'
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
    ],

    socket: null,
    myUserId: null,
    myUser: { name: '', initials: '', color: '#7c6af7'},
    currentChannel: null,
    currentPins: [],

    unread: {},
    channelMessages: {},
    reactionsByMsg: {},
    openThreads: new Set(),
    threadReplies: {}
}

export const $ = id => document.getElementById(id);