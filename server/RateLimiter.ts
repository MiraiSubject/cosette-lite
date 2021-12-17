import { Request, Response } from 'express'
import { RateLimiterMemory } from 'rate-limiter-flexible'

const rateLimiter = new RateLimiterMemory({
    points: 10, // 10 requests
    duration: 1, // per 1 second by IP
});

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default async function rateLimiterMiddleware(req: Request, res: Response, next: any) {
    try {
        await rateLimiter.consume(req.ip);
        next();
    } catch {
        res.status(429).send('Too Many Requests');
    }
}

//export default rateLimiterMiddleware
