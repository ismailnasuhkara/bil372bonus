import redis from "../redis/client.js";
import { msgKey, pinsKey } from '../models/message.model.js';

export async function pinMessage(channelId, msgId) {
    const exists = await redis.exists(msgKey(msgId));
    if (!exists) throw new Error(`ERROR: Message ${msgId} not found`);

    const pinnedAt = Date.now();

    await redis
        .multi()
        .hSet(msgKey(msgId), 'pinned', '0')
        .zRem(pinsKey(channelId), msgId)
        .exec();
}

export async function unpinMessage(channelId, msgId) {
    const exists = await redis.exists(msgKey(msgId));
    if (!exists) throw new Error(`ERROR: Message ${msgId} not found`);

    await redis
        .multi()
        .hSet(msgKey(msgId), 'pinned', '0')
        .zRem(pinsKey(channelId), msgId)
        .exec();
}

export async function getPinnedMessages(channelId) {
    const msgIds = await redis.zRange(pinsKey(channelId), 0, -1, { REV: true });
    if (!msgIds.length) return [];

    const messages = await Promise.all(
        msgIds.map(id => redis.hGetAll(msgKey(id)))
    );
    return messages
        .map((msg, i) => ({ id: msgIds[i], ...msg }))
        .filter(msg => msg.text !== undefined);
}