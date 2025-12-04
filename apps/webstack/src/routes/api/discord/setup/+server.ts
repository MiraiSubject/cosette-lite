import type { RequestHandler } from './$types';
import { config } from 'config';
import { env } from '$env/dynamic/private';
import { logger } from '$lib/logger';
import { BotResult } from '$lib/DiscordTypes';

enum MemberResult {
    Found,
    NotFound,
    Error
}

async function getGuildMember(id: string) {
    try {
        const response = await fetch(`https://discord.com/api/v10/guilds/${config.discord.guildId}/members/${id}`, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bot ${env.DISCORD_BOT_TOKEN}`
            },
        });

        const json = await response.json();
        switch (response.status) {
            case 200:
                return { content: json, result: MemberResult.Found } as const;
            case 404:
                logger.info(`User ${id} not found in guild.`);
                return { content: json, result: MemberResult.NotFound } as const;
            default:
                logger.error(`Error checking if user ${id} exists in guild: ${response.status}: ${response.statusText}`);
                return { content: json, result: MemberResult.Error } as const;
        }
    } catch (e) {
        logger.error(e);
        return { content: { code: -5000, message: 'Network error' }, result: MemberResult.Error } as const;
    }
}

async function joinDiscordServer(userId: string, accessToken: string, nickname: string) {
    try {
        const response = await fetch(`https://discord.com/api/v10/guilds/${config.discord.guildId}/members/${userId}`, {
            body: JSON.stringify({
                access_token: accessToken,
                nick: nickname,
                roles: config.discord.roles.map((val) => val.id)
            }),
            method: 'PUT',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bot ${env.DISCORD_BOT_TOKEN}`
            },
        });

        switch (response.status) {
            case 201:
            case 204:
                return { result: BotResult.Success, error: null } as const;
            case 400:
                return { result: BotResult.Full, error: await response.json() } as const;
            default:
                return { result: BotResult.Error, error: await response.json() } as const;
        }
    } catch (e) {
        logger.error(e);
        return { result: BotResult.Error, error: { code: -5000, message: 'Network Error' } } as const;
    }
}

async function modifyGuildMember(userId: string, nick: string, roles?: string[]) {
    const response = await fetch(`https://discord.com/api/v10/guilds/${config.discord.guildId}/members/${userId}`, {
        body: JSON.stringify({ nick, roles }),
        method: 'PATCH',
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bot ${env.DISCORD_BOT_TOKEN}`,
            "X-Audit-Log-Reason": `Updated user ${userId} from cosette`,
        },
    });

    switch (response.status) {
        case 200:
        case 204:
            return { result: BotResult.Success, error: null } as const;
        default:
            return { result: BotResult.Error, error: await response.json() } as const;
    }
}

export const POST = (async ({ locals }) => {
    const discordId = locals.session.data.discord?.id;
    const accessToken = locals.session.data.discord?.accessToken;
    const osuUsername = locals.session.data.osu?.username ?? '';

    if (!discordId || !accessToken) {
        return new Response(JSON.stringify({ result: 'error', message: 'Missing session data.' }), { status: 400 });
    }

    const memberCheck = await getGuildMember(discordId);

    if (memberCheck.result === MemberResult.Found) {
        logger.info(`User ${discordId} already exists in the guild. Adding roles...`);

        const requiredRoles = config.discord.roles.map((val) => val.id);
        const guildMember = memberCheck.content as { roles: string[] };
        const mergedRoles = Array.from(new Set([...(guildMember.roles || []), ...requiredRoles]));
        const addRoleRes = await modifyGuildMember(discordId, osuUsername, mergedRoles);

        if (addRoleRes.result === BotResult.Success) {
            await locals.session.update((d) => { (d as any).isReady = true; return d; });
            return new Response(JSON.stringify({ result: 'success' }));
        }

        return new Response(JSON.stringify({ result: 'error', message: addRoleRes.error?.message || 'Failed adding roles' }), { status: 500 });
    }

    if (memberCheck.result === MemberResult.NotFound) {
        const joinRes = await joinDiscordServer(discordId, accessToken, osuUsername);

        if (joinRes.result === BotResult.Full) {
            await locals.session.update((d) => { d.error = 'You have joined the maximum amount of servers.'; return d; });
            return new Response(JSON.stringify({ result: 'full' }), { status: 200 });
        }

        if (joinRes.result !== BotResult.Success) {
            return new Response(JSON.stringify({ result: 'error', message: joinRes.error?.message || 'Failed to join server' }), { status: 500 });
        }

        const requiredRoles = config.discord.roles.map((val) => val.id);
        const addRoleRes = await modifyGuildMember(discordId, osuUsername, requiredRoles);

        if (addRoleRes.result === BotResult.Success) {
            await locals.session.update((d) => { (d as any).isReady = true; return d; });
            return new Response(JSON.stringify({ result: 'success' }));
        }

        return new Response(JSON.stringify({ result: 'error', message: addRoleRes.error?.message || 'Failed adding roles' }), { status: 500 });
    }

    return new Response(JSON.stringify({ result: 'error', message: 'Discord API error' }), { status: 502 });
}) satisfies RequestHandler;


