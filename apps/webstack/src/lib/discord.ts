import { config } from 'config';
import { env } from '$env/dynamic/private';
import { logger } from '$lib/logger';
import { BotResult } from '$lib/DiscordTypes';
import type { DiscordErrorResponse } from '$lib/DiscordTypes';

export enum MemberResult {
    Found,
    NotFound,
    Error
}

async function safeJson<T>(response: Response): Promise<T | { code: number; message: string }> {
    try {
        return await response.json();
    } catch {
        return { code: response.status, message: response.statusText || 'Invalid JSON response' };
    }
}

export async function getGuildMember(id: string): Promise<{
    content: { roles?: string[] } | DiscordErrorResponse;
    result: MemberResult;
}> {
    try {
        const response = await fetch(`https://discord.com/api/v10/guilds/${config.discord.guildId}/members/${id}`, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bot ${env.DISCORD_BOT_TOKEN}`
            },
        });

        const json = await safeJson(response);
        switch (response.status) {
            case 200:
                return { content: json as { roles?: string[] }, result: MemberResult.Found };
            case 404:
                logger.info(`User ${id} not found in guild.`);
                return { content: json as DiscordErrorResponse, result: MemberResult.NotFound };
            default: {
                const errRes = json as DiscordErrorResponse;
                logger.error(`Error checking if user ${id} exists in guild: ${response.status}: ${response.statusText} ${'code' in errRes ? errRes.code : ''} ${'message' in errRes ? errRes.message : ''}`);
                return { content: errRes, result: MemberResult.Error };
            }
        }
    } catch (e) {
        logger.error(e);
        return { content: { code: -5000, message: 'Network error' }, result: MemberResult.Error };
    }
}

export async function joinDiscordServer(
    userId: string,
    accessToken: string,
    nickname: string
): Promise<{ result: BotResult; error: null | DiscordErrorResponse }> {
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

        const json = await safeJson<DiscordErrorResponse>(response);
        const errRes = json as DiscordErrorResponse;

        switch (response.status) {
            case 201:
                logger.info(`${userId} joined to server.`);
                return { result: BotResult.Success, error: null };
            case 204:
                logger.info(`${userId} is already in the guild.`);
                return { result: BotResult.Success, error: null };
            case 400:
                logger.warn(`${userId} has reached maximum guilds.`);
                return { result: BotResult.Full, error: errRes };
            default:
                logger.error(`Error joining ${userId} to server: ${response.status}: ${response.statusText} ${errRes.code} ${errRes.message}`);
                return { result: BotResult.Error, error: errRes };
        }
    } catch (e) {
        logger.error(e);
        return { result: BotResult.Error, error: { code: -5000, message: 'Network Error' } };
    }
}

export async function modifyGuildMember(
    userId: string,
    nick: string,
    roles?: string[]
): Promise<{ result: BotResult; error: null | DiscordErrorResponse }> {
    try {
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
                return { result: BotResult.Success, error: null };
            default: {
                const errRes = (await safeJson<DiscordErrorResponse>(response)) as DiscordErrorResponse;
                logger.error(`Error modifying guild member ${userId}: ${response.status}: ${response.statusText} ${errRes.code} ${errRes.message}`);
                return { result: BotResult.Error, error: errRes };
            }
        }
    } catch (e) {
        logger.error(e);
        return { result: BotResult.Error, error: { code: -5000, message: 'Network error' } };
    }
}
