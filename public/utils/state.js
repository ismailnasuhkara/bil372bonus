
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
];

let socket = null;
let myUserId = null;
let myUser = { name: '', initials: '', color: '#7c6af7'};
let currentChannel = null;
let currentPins = [];

const unread = {};
const channelMessages = {};
const reactionsByMsg = {};
const openThreads = new Set();
const threadReplies = {};

const $ = id => document.getElementById(id);

export default state;