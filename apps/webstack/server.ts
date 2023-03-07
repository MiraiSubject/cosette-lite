import "reflect-metadata"
// @ts-ignore
import { handler } from "./build/handler.js"; //file from adapter-node
import fastify from "fastify";
import helmet from '@fastify/helmet';

(async () => {
    try {
        //fastify
        const app = fastify({
            connectionTimeout: 0,
            keepAliveTimeout: 5000,
            maxRequestsPerSocket: 0,
            requestTimeout: 0,
            ignoreTrailingSlash: true,
            bodyLimit: 1024 * 1024 * 10,
            disableRequestLogging: false,
        });

        //necessary!!!
        app.removeAllContentTypeParsers();
        app.addContentTypeParser("*", (_req, _payload, done) => done(null, null));

        await app.register(helmet, { contentSecurityPolicy: false, crossOriginEmbedderPolicy: false, });

        //other path
        app.get("/check", async () => {
            return "ok";
        });

        app.get('/*', (request, response) => {
            handler(request.raw, response.raw, () => {});
        })

        // app.get("/*", (req: any, res: any, next: any) => {
        //     return handler(req.raw, res.raw, next)
        // });

        await app.listen({
            port: 8000
        });

    } catch (e) {
        console.log(e);
        process.exit(-1);
    }
})();