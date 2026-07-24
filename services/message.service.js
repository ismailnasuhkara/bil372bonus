import redis from '../redis/client.js';
import { v4 as uuid } from 'uuid';
import { msgKey, channelMsgKey, threadKey, pinsKey, reactSetKey, reactCountKey } from '../models/message.model.js';
import { paginateZSet, batchGetMessages } from '../utils/pipeline.js';

export async function sendMessage({ channelId, userId, text, replyTo }) {
    const msgId = uuid();
    const timestamp = Date.now();
    
    const multi = redis
        .multi()
        .hSet(msgKey(msgId), { text, userId, channelId, replyTo: replyTo ?? '', timestamp: String(timestamp) })
        .zAdd(channelMsgKey(channelId), { score: timestamp, value: msgId });

    if (replyTo) {
        multi.zAdd(threadKey(replyTo), { score: timestamp, value: msgId });
    }

    await multi.exec();
    return { id: msgId, text, userId, channelId, replyTo, timestamp };
}

export async function getMessages(channelId, { before, limit }) {
    const { items, next } = await paginateZSet(channelMsgKey(channelId), { before, limit });
    const messages = await batchGetMessages(items.map(item => item.id));
    return { messages, next }
}

export async function deleteMessage(msgId) {
    const msg = await redis.hGetAll(msgKey(msgId));
    if (!msg?.text) throw new Error(`ERROR: Message ${msgId} not found`);

    const reactionCounts = await redis.hGetAll(reactCountKey(msgId));
    const emojis = Object.keys(reactionCounts);

    const multi = redis
        .multi()
        .del(msgKey(msgId))
        .zRem(channelMsgKey(msg.channelId), msgId)
        .zRem(pinsKey(msg.channelId), msgId)
        .del(reactCountKey(msgId));

    emojis.forEach(emoji => multi.del(reactSetKey(msgId, emoji)));

    if (msg.replyTo) {
        multi
            .zRem(threadKey(msg.replyTo), msgId)
            .hIncrBy(msgKey(msg.replyTo), 'replyCount', -1);
    } else {
        multi.del(threadKey(msgId));
    }

    await multi.exec();

    return { id: msgId, channelId: msg.channelId, replyTo: msg.replyTo || null };
}