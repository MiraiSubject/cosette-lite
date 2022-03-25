/* eslint-disable sort-imports */
import "reflect-metadata"
import path from 'path'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
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
import RedisSession from './RedisSession';
import ApiRouting from './api/index';
import Configuration from './Configuration';
import https from 'https';
import fs from 'fs';
import flash from 'connect-flash';

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

        const redis = container.resolve(RedisSession);
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
            sessionOptions.cookie!.secure = !!parseInt(process.env.COOKIE_SECURE ?? '0')
        }
        consola.info(`Cookies secure: ${sessionOptions.cookie?.secure}`);

        // Inject the variables
        const configClass = container.resolve<Configuration>(Configuration);
        const config = configClass.config;

        const allowedOrigins = ['http://localhost:8000', 'https://10.0.1.110:8000', 'http://10.0.1.110:8000', 'https://oth.mirai.gg/']
        if (config.domains.length > 0) {
            for (let i = 0; i < config.domains.length; i++) {
                allowedOrigins.push(`http://${config.domains[i]}`);
                allowedOrigins.push(`https://${config.domains[i]}`)
            }
        }

        const corsOptions: CorsOptions = {
            allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'X-Access-Token', 'Authorization'],
            origin: allowedOrigins,
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
        app.use(flash());

        consola.info(`Allowed origins: `)
        for (let i = 0; i < allowedOrigins.length; i++) 
            console.log(`- ${allowedOrigins[i]}`);

        // Initialise API
        const api = container.resolve(ApiRouting);
        app.use('/api', api.router);

        // Initialise the authentication client for osu!
        const o = container.resolve<OsuAuthentication>(OsuAuthentication);
        app.use(`/auth${o.RootURL}`, o.router);

        // Initialise the authentocation client for Discord. 
        container.register<DiscordAuthentication>(DiscordAuthentication, { useValue: new DiscordAuthentication([Scope.IDENTIFY, Scope.GUILDS_JOIN]) })
        const d = container.resolve(DiscordAuthentication);
        app.use(`/auth${d.RootURL}`, d.router);

        // Start the discord bot
        container.register<Client>(Client, { useValue: new DiscordBot() });

        // Save data to session
        passport.serializeUser((user: any, done: any) => {
            done(null, user);
        });

        // Get data from session
        passport.deserializeUser((user: any, done: any) => {
            done(null, user);
        });

        if (isDev)
            await build(nuxt);

        app.get('/checks/discord', (req: Request, res: Response, next: NextFunction) => {
            if (req.isAuthenticated())
                return next();
            else {
                req.flash('error', "You're not authorized to perform this action.");
                return res.redirect('/')
            }
        });

        app.use(nuxt.render);

        // Set to 127.0.0.1 for localhost only
        const host = '0.0.0.0';

        const port = 8000;

        if (config.dev.https) {
            app.listen(8001, host);
            https.createServer({
                key: fs.readFileSync('./server/cert/key.pem'),
                cert: fs.readFileSync('./server/cert/cert.pem')
            }, app).listen(port, () => {
                consola.ready(`Serving verifications for ${config.name} on http://localhost:${port}/`);
            });
        } else 
            app.listen(port, host);
        
    }
}

new Server().start();
