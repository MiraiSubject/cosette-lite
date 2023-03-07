import Fastify, { FastifyReply, FastifyRequest } from 'fastify';
import dotenv from 'dotenv';
import DiscordBot from './bot';
import fs from 'fs'

dotenv.config();

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
    try {
        //await fastify.listen({ host: '0.0.0.0', port: 3000 });
        fs.unlinkSync('/tmp/discordbot.sock');
        await fastify.listen({ path: '/tmp/discordbot.sock' })
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}
start()