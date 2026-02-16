import type { RequestHandler } from './$types';
import { config } from 'config';
import { logger } from '$lib/logger';
import { BotResult } from '$lib/DiscordTypes';
import { getGuildMember, joinDiscordServer, modifyGuildMember, MemberResult } from '$lib/discord';

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
            await locals.session.update((d) => { d.isReady = true; return d; });
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
            await locals.session.update((d) => { d.isReady = true; return d; });
            return new Response(JSON.stringify({ result: 'success' }));
        }

        return new Response(JSON.stringify({ result: 'error', message: addRoleRes.error?.message || 'Failed adding roles' }), { status: 500 });
    }

    return new Response(JSON.stringify({ result: 'error', message: 'Discord API error' }), { status: 502 });
}) satisfies RequestHandler;
