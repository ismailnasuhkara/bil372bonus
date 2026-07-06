import redis from '../redis/client.js';
import { v4 as uuid } from 'uuid';
import {
    msgKey,
    channelMsgKey,
    threadKey
} from '../models/message.model.js';

export async function getThread(parentId) {
    const parent = await redis.hGetAll(msgKey(parentId));
    if (!parent?.text) throw new Error(`ERROR: Message ${parentId} not found`);

    const replyIds = await redis.zRange(threadKey(parentId), 0, -1);
    if (!replyIds.length) return { 
        parent: { id: preantId, ...parent },
        replies: []
    };

    const replies = await Promise.all(
        replyIds.map(id => redis.hGetAll(msgKey(id)))
    );

    return {
        parent: { id: prentId, ...parent },
        replies: replies
            .map((reply, i) => ({ id: replyIds[i], ...reply }))
            .filter(r => r.text !== undefined)
    };
}

export async function sendReply({ parentId, userId, text }) {
    const parent = await redis.hGetAll(msgKey(parentId));
    if (!parent?.text) throw new Error(`ERROR: Message ${parentId} no found`);

    const rootId = parent.replyTo || parentId;
    const msgId = uuid();
    const timestamp = Date.now();

    await redis
        .multi()
        .hSet(msgKey(msgId), {
            text,
            userId,
            channelId:  parent.channelId,
            replyTo:    rootId,
            pinned:     '0',
            timestamp,
            edited:     '0'
        })
        .zAdd(threadKey(rootId), { 
            score: timestamp,
            value: msgId
        })
        .hIncrBy(msgKey(rootId), 'replyCount', 1)
        .exec();

        const replyCount = await redis.hGet(msgKey(rootId), 'replyCount');

        return {
            reply: {
                id:         msgId,
                text,
                userId,
                channelId:  parent.channelId,
                replyTo:    rootId,
                timestamp
            },
            replyCount: parseInt(replyCount, 10)
        };
}