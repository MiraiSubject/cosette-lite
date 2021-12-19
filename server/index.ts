import path from 'path'
import "reflect-metadata"

// @ts-ignore
import { build, loadNuxt } from 'nuxt';

import consola from 'consola'
import express, { Express, NextFunction, Request, Response } from 'express';
import session from 'express-session'
import helmet from 'helmet';
import passport from 'passport';
import rateLimiterMiddleware from './RateLimiter';
import { Scope } from "@oauth-everything/passport-discord";
import { DiscordAuthentication } from './auth/DiscordAuth';
import { OsuAuthentication } from './auth/OsuAuth';
import cors, { CorsOptions } from 'cors';
import bodyParser from 'body-parser';
import { container } from 'tsyringe';
import { Client } from 'discord.js';
import DiscordBot from './DiscordBot';
import SessionProvider from './SessionManager';

export default class Server {
    private app: Express;

    constructor() {
        this.app = express();
    }

    async start(): Promise<void> {
        const app = this.app;
        const isDev = process.env.NODE_ENV !== 'production'
        const rootDir = path.resolve(__dirname, '..')

        const nuxt = await loadNuxt(isDev ? 'dev' : 'start', rootDir);

        consola.wrapConsole();

        container.register<SessionProvider>(SessionProvider, { useValue: new SessionProvider() })
        const redis = container.resolve(SessionProvider);
        const redisStore = redis.getStore();

        const sessionOptions: session.SessionOptions = {
            name: '_session',
            secret: `${process.env.COOKIE_SECRET}`,
            resave: false,
            proxy: true,
            saveUninitialized: false,
            cookie: {
                secure: false,
                maxAge: 300 * 1000
            },
            store: new redisStore({ client: redis.getClient(), ttl: 600 }),
        }

        if (process.env.NODE_ENV === 'production') {
            app.set('trust proxy', 1) // trust first proxy
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            sessionOptions.cookie!.secure = true
        }

        const corsOptions: CorsOptions = {
            allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'X-Access-Token', 'Authorization'],
            origin: ['http://localhost:3000', 'http://localhost:8000', 'http://10.0.1.110:8000', 'http://10.0.1.110:3000', 'https://oth.mirai.gg/', 'https://oth.mirai.gg/'],
            optionsSuccessStatus: 200,
            preflightContinue: false,
            credentials: true
        }

        app.use(cors(corsOptions));
        app.use(session(sessionOptions));
        app.use(passport.initialize());
        app.use(passport.session());
        app.use(helmet());
        app.use(rateLimiterMiddleware);
        app.use(bodyParser.json());

        const o = new OsuAuthentication();
        app.use(`/auth${o.RootURL}`, o.router);
        console.log(`/auth${o.RootURL}`);

        const d = new DiscordAuthentication([Scope.IDENTIFY, Scope.GUILDS_JOIN]);
        app.use(`/auth${d.RootURL}`, d.router);
        console.log(`/auth${d.RootURL}`);

        container.register(Client, { useValue: new DiscordBot() });

        app.get('/discord-check', (req: Request, res: Response, next: NextFunction) => {
            if (req.isAuthenticated())
                return next()

            console.error("Redirected user to front page due to cookie errors or missing osu! information. Could be anything.")
            res.redirect('/');
        });

        passport.serializeUser((user: any, done: any) => { // Save data to session
            done(null, user);
        });

        passport.deserializeUser((user: any, done: any) => { // Get data from session
            done(null, user);
        });

        const port = 8000;

        if (isDev)
            await build(nuxt);

        app.use(nuxt.render);

        app.listen(port, '0.0.0.0');
        console.log("Listening");
    }
}

new Server().start();
