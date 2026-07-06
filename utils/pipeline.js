import redis from '../redis/client.js';

export async function batchGetMessages(msgIds) {
  if (!msgIds.length) return [];

  const messages = await Promise.all(
    msgIds.map(id => redis.hGetAll(`msg:${id}`))
  );

  return messages
    .map((msg, i) => ({ id: msgIds[i], ...msg }))
    .filter(msg => msg.text !== undefined);
}

export async function paginateZSet(key, { before = '+inf', limit = 50 } = {}) {
  const results = await redis.zRangeByScoreWithScores(key, '-inf', before, {
    REV:   true,
    LIMIT: { offset: 0, count: limit + 1 },
  });

  const hasMore = results.length > limit;
  const page    = hasMore ? results.slice(0, limit) : results;

  return {
    items: page.map(({ value, score }) => ({ id: value, score })),
    next:  hasMore ? page[page.length - 1].score - 1 : null,
  };
}