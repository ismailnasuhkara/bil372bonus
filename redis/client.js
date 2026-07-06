import { createClient, ReconnectStrategyError } from "redis";
import { config } from '../config.js';

const {
    REDIS_HOST      = 'localhost',
    REDIS_PORT      = '6379',
    REDIS_PASSWORD,
    REDIS_TLS,
    NODE_ENV        = 'development',
} = process.env

const url = `redis://${config.redis.host}:${config.redis.port}`;

const redis = createClient({
    url,
    password: config.redis.password,
    socket: {
        tls: config.redis.tls,

        reconnectStrategy(attempt) {
            if (attempt > 10) {
                console.error('[redis] Max reconnect attempts reached, giving up');
                return new Error('Max reconnect attempts reached');
            }
            const delay = Math.min(100 * 2 ** attempt, 5000);
            console.warn(`[redis] Reconnecting in ${delay}ms (attempt ${attempt})`);

            return delay
        },
    },
});

redis.on('connect',         () => console.log('[redis] Connecting...'));
redis.on('ready',           () => console.log('[redis] Ready'));
redis.on('error',        (err) => console.warn('[redis] Error: ', err.message));
redis.on('reconnecting',    () => console.warn('[redis] Reconnecting...'));
redis.on('end',             () => console.warn('[redis] Connection ended'));

await redis.connect();

async function reconnect(key) {
    if (key === "r") {
        console.log("[redis] Reconnect requested.");
        if (redis.isOpen) {
            await redis.quit();
        }
        await redis.connect()
    }
    if (key === "\u0003") { // Ctrl+C
        console.log("[redis] Caught SIGINT.");
        process.stdin.setRawMode(false);
        if (redis.isOpen) {
            console.log('[redis] Shutting down...');
            await redis.quit();
        }
        process.exit(0);
    }

}

if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding("utf8");
    process.stdin.on('data', reconnect);
}

export default redis;