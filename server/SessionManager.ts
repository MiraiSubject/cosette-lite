import redis from 'redis';
import connectRedis from 'connect-redis';
import session from 'express-session';
import consola from 'consola';
import { singleton } from "tsyringe";

@singleton()
export default class SessionProvider {
    private redisStore: connectRedis.RedisStore;
    private redisClient: redis.RedisClient;

    constructor(sessionHost: string, sessionPort: number) {
        this.redisStore = connectRedis(session);
        this.redisClient = redis.createClient({
            host: sessionHost,
            port: sessionPort,
        });
    }
    public connect(): void {
        this.redisClient.on('error', err => {
            consola.error('Redis error: ', err);
        });
        this.redisClient.on('ready', () => {
            consola.ready('Initialized Redis')
        })
    }
    public getStore(): connectRedis.RedisStore {
        return this.redisStore;
    }
    public getClient(): redis.RedisClient {
        return this.redisClient
    }
}
