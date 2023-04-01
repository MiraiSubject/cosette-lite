import Fastify, { FastifyReply, FastifyRequest } from 'fastify';
import DiscordBot from './bot';
import fs from 'fs'

const bot = new DiscordBot();

const fastify = Fastify({
    logger: true
});

type MemberExistsRequest = FastifyRequest<{
    Querystring: {
        guildId: string;
        userId: string;
    }
}>

fastify.get('/api/guildmemberexists', async (request: MemberExistsRequest, reply: FastifyReply) => {
    const { guildId, userId } = request.query;
    const exists = await bot.guildMemberExists(guildId, userId);

    return reply.send(exists);
});

const schema = {
    body: {
        type: 'object',
        required: ['userId', 'nickname'],
        properties: {
            userId: { type: 'string' },
            nickname: { type: 'string' }
        }
    }
}

fastify.post('/api/setupuser', { schema }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { userId, nickname } = request.body as { userId: string, nickname: string };
    await bot.setUpUser(userId, nickname);

    return reply.send(true);
})


const start = async () => {

    // Remove socket file if it exists. Could be made cleaner by just cleaning up the file on exit.
    try {
        fs.unlinkSync('/tmp/gg.mirai.oth.discordbot-api.sock');
    } catch {}

    try {
        await fastify.listen({ path: '/tmp/gg.mirai.oth.discordbot-api.sock' })
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}
start()