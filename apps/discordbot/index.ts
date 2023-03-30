import Fastify, { FastifyReply, FastifyRequest } from "fastify";
import dotenv from "dotenv";
import DiscordBot from "./bot";
import fs from "fs";

dotenv.config();

const bot = new DiscordBot();

const fastify = Fastify({
  logger: true,
});

type MemberExistsRequest = FastifyRequest<{
  Querystring: {
    guildId: string;
    userId: string;
  };
}>;

fastify.get("/api/guildmemberexists",
  async (request: MemberExistsRequest, reply: FastifyReply) => {
    const { guildId, userId } = request.query;
    const exists = await bot.guildMemberExists(guildId, userId);

    return reply.send(exists);
  }
);

fastify.get("/api/preverified",
  async (request: MemberExistsRequest, reply: FastifyReply) => {
    const { guildId, userId } = request.query;
    const preverified = await bot.preVerified(guildId, userId);

    return reply.send({ preverified });
  }
);


fastify.post("/api/setupverifieduser",
  {
    schema: {
      body: {
        type: "object",
        required: ["userId", "nickname", "osu_url", "reddit_url"],
        properties: {
          userId: { type: "string" },
          osu_url: { type: "string" },
          reddit_url: { type: "string" },
        },
      },
    },
  },
  async (request: FastifyRequest, reply: FastifyReply) => {
    const { userId, nickname, osu_url, reddit_url } = request.body as {
      userId: string;
      nickname: string;
      osu_url: string;
      reddit_url: string;
    };
    await bot.setupVerified(userId, nickname, {osu_url, reddit_url});

    return reply.send(true);
  }
);

fastify.post("/api/setupmanualuser",
  {
    schema: {
      body: {
        type: "object",
        required: ["userId", "osu_url", "reddit_url"],
        properties: {
          userId: { type: "string" },
          osu_url: { type: "string" },
          reddit_url: { type: "string" },
        },
      },
    },
  },
  async (request: FastifyRequest, reply: FastifyReply) => {
    const { userId, osu_url, reddit_url } = request.body as {
      userId: string;
      osu_url: string;
      reddit_url: string;
    };
    await bot.setupManual(userId, {osu_url, reddit_url});

    return reply.send(true);
  }
);

const start = async () => {
  // Remove socket file if it exists. Could be made cleaner by just cleaning up the file on exit.
  try {
    fs.unlinkSync("/tmp/gg.mirai.oth.discordbot-api.sock");
  } catch {}

  try {
    await fastify.listen({ path: "/tmp/gg.mirai.oth.discordbot-api.sock" });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
