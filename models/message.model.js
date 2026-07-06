export const msgKey         = (id) => `msg:${id}`;
export const channelMsgKey  = (channelId) => `channel:${channelId}:msgs`;
export const threadKey      = (msgId) => `msg:${msgId}:replies`;
export const pinsKey        = (channelId) => `channel:${channelId}:pins`;
export const reactSetKey    = (msgId, emoji) => `msg:${msgId}:reacts:${emoji}`;
export const reactCountKey = (msgId) => `msg:${msgId}:reacts`;