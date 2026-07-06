import redis from '../redis/client.js';
import {
    msgKey,
    reactSetKey,
    reactCountKey
} from '../models/message.model.js';

export async function toggleReaction(msgId, emoji, userId) {
    const msg = await redis.hGetAll(msgKey(msgId));
    if (!msg?.text) throw new Error(`ERROR: Message ${msgId} not found`);

    const setKey    = reactSetKey(msgId, emoji);
    const countKey  = reactCountKey(msgId);

    const alreadyReacted = await redis.sIsMember(setKey, userId);

    await redis
        .multi()
        [alreadyReacted ? 'sRem' : 'sAdd'](setKey, userId)
        .hIncrBy(reactCountsKey, emoji, alreadyReacted ? -1 : 1)
        .exec()

    const reactions = await getReactions(msgId);
    return {
        channelId: msg.channelId,
        reactions,
        action: alreadyReacted ? 'removed' : 'added'
    };
}

export async function getReactions(msgId) {
    const counts = await redis.hGetAll(reactCountKey(msgId));
    if (!counts) return [];

    return Object.entries(counts)
        .map(([emoji, count]) => ({ emoji, count: parseInt(count, 10) }))
        .filter(r => r.count > 0)
        .sort((a, b) => b.count - a.count);
}

export async function getUsersWhoReacted(msgId, emoji) {
    return redis.sMembers(reactSetKey(msgId, emoji));
}