import { env } from '$env/dynamic/private';
import { env as pubEnv } from '$env/dynamic/public';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { config } from 'config';
import { BotResult } from '$lib/DiscordTypes';
import type { DiscordOAuth2User, DiscordData, DiscordErrorResponse } from '$lib/DiscordTypes';
import type { RESTGetAPIGuildMemberResult } from 'discord-api-types/rest'

enum MemberResult {
    Found,
    NotFound,
    Error
}

async function getOAuthTokens(code: string) {
    const url = 'https://discord.com/api/v10/oauth2/token';
    const body = new URLSearchParams({
        client_id: `${pubEnv.PUBLIC_DISCORD_CLIENT_ID}`,
        client_secret: `${env.DISCORD_CLIENT_SECRET}`,
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${pubEnv.PUBLIC_BASE_URL}/auth/discord/callback`,
    });

    const response = await fetch(url, {
        body,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });
    if (response.ok) {
        const data = await response.json();
        return data;
    } else {
        throw new Error(`Error fetching OAuth tokens: [${response.status}] ${response.statusText}`);
    }
}

async function getUserData(tokens: {
    access_token: string;
    token_type: string;
}) {
    const url = 'https://discord.com/api/v10/oauth2/@me';
    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${tokens.access_token}`,
        },
    });
    if (response.ok) {
        const data = await response.json();
        return data;
    } else {
        throw new Error(`Error fetching user data: [${response.status}] ${response.statusText}`);
    }
}

async function setupUser(user: DiscordOAuth2User, token: string, nickname: string): Promise<{
    result: BotResult,
    error: null | DiscordErrorResponse
}> {
    try {
        const { content, result } = await getGuildMember(user.id);
        switch (result) {
            case MemberResult.Found: {
                const guildMember = content as RESTGetAPIGuildMemberResult;

                console.log(`User ${user.id} already exists in the guild. Adding roles...`)
                const { result, error } = await addRoleToUser(user.id, [...guildMember.roles, ...config.discord.roles.map((val) => val.id)], token, nickname);
                return {
                    result,
                    error
                }
            }
            default:
            case MemberResult.NotFound: {
                console.log(`User ${user.id} does not exist in the guild. Adding user...`)
                const { result, error } = await joinDiscordServer(user, token, nickname);
                switch (result) {
                    case BotResult.Success: {
                        const { result, error } = await addRoleToUser(user.id, config.discord.roles.map((val) => val.id), token, nickname);
                        return {
                            result,
                            error
                        }
                    }
                    default: {
                        return {
                            result,
                            error
                        }
                    }
                }
            }
        }
    } catch (e) {
        console.log(e);
        return {
            result: BotResult.Error,
            error: {
                code: -5000,
                message: "Network Error"
            }
        }
    }
}

async function joinDiscordServer(user: DiscordOAuth2User, token: string, nickname: string): Promise<{
    result: BotResult,
    error: null | DiscordErrorResponse
}> {
    try {
        // Join user to the discord server.
        const response = await fetch(`https://discord.com/api/v10/guilds/${config.discord.guildId}/members/${user.id}`, {
            body: JSON.stringify({
                access_token: token,
                nick: nickname,
                roles: config.discord.roles.map((val) => val.id)
            }),
            method: 'PUT',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bot ${env.DISCORD_BOT_TOKEN}`
            },
        });

        const json: RESTGetAPIGuildMemberResult | DiscordErrorResponse = await response.json()

        // Check if user already exists in the server.
        switch (response.status) {
            case 201:
                console.log(`Joined ${user.id} to server!`);
                break;
            case 204:
                console.log(`User is already in the guild.`);
                break;
            case 400: {
                console.log(`${user.id} - ${user.username} has reached maximum guilds.`);
                return {
                    result: BotResult.Full,
                    error: json as DiscordErrorResponse
                };
            }
            case 403:
            default: {
                const errRes = json as DiscordErrorResponse;
                console.log(`Error joining ${user.id} to server!: ${response.status}: ${response.statusText} ${errRes.code} ${errRes.message}`);
                return {
                    result: BotResult.Error,
                    error: errRes
                }
            }
        }

        return {
            result: BotResult.Success,
            error: null
        }
    } catch (e) {
        console.log(e);
        return {
            result: BotResult.Error,
            error: {
                code: -5000,
                message: "Network Error"
            }
        }
    }
}

async function getGuildMember(id: string): Promise<{
    content: RESTGetAPIGuildMemberResult | DiscordErrorResponse,
    result: MemberResult
}> {
    try {
        const response = await fetch(`https://discord.com/api/v10/guilds/${config.discord.guildId}/members/${id}`, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bot ${env.DISCORD_BOT_TOKEN}`
            },
        });

        const json: RESTGetAPIGuildMemberResult | DiscordErrorResponse = await response.json()

        switch (response.status) {
            case 200:
                return {
                    content: json as RESTGetAPIGuildMemberResult,
                    result: MemberResult.Found
                };
            case 404:
                console.log(`User ${id} not found in guild.`);
                return {
                    content: json as DiscordErrorResponse,
                    result: MemberResult.NotFound
                }
            default: {
                const errRes = json as DiscordErrorResponse
                console.log(`Error checking if user ${id} exists in guild: ${response.status}: ${response.statusText} ${errRes.code} ${errRes.message}`)
                return {
                    content: errRes,
                    result: MemberResult.Error
                }
            }
        }
    } catch (e) {
        console.error(e);
        return {
            content: {
                code: -5000,
                message: 'Network error'
            },
            result: MemberResult.Error
        }
    }
}

async function addRoleToUser(userId: string, roles: string[], token: string, nick: string): Promise<{
    result: BotResult,
    error: null | DiscordErrorResponse
}> {
    const response = await fetch(`https://discord.com/api/v10/guilds/${config.discord.guildId}/members/${userId}`, {
        body: JSON.stringify({
            access_token: token,
            nick,
            roles
        }),
        method: 'PATCH',
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bot ${env.DISCORD_BOT_TOKEN}`
        },
    });

    switch (response.status) {
        case 200:
        case 204:
            return {
                result: BotResult.Success,
                error: null
            }
        case 400:
        case 404:
        default: {
            const errRes: DiscordErrorResponse = await response.json()
            console.log(`Error adding role to user ${userId}: ${response.status}: ${response.statusText} ${errRes.code} ${errRes.message}`)
            return {
                result: BotResult.Error,
                error: errRes
            }
        }
    }
}

async function sendMessageToWelcomeChannel(data: SessionData) {

    const body = JSON.stringify({
        content: `Welcome <@${data.discord?.id}> you are now verified!`
        // embeds: [
        //     {
        //         "title": `${data.osu?.username} has joined the server!`,
        //         "color": 2458853,
        //         "timestamp": `${new Date().toISOString()}`,
        //         "thumbnail": {
        //             "url": `https://a.ppy.sh/${data.osu?.id}?428927893258930.jpeg`
        //         },
        //         "author": {
        //             "name": `User sucessfully joined ${config.name}`,
        //             "url": `${pubEnv.PUBLIC_BASE_URL}`
        //         }
        //     }
        // ]
    });

    try {
        await fetch(`https://discord.com/api/v10/channels/${config.discord.welcomeChannelId}/messages`, {
            method: 'POST',
            body,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bot ${env.DISCORD_BOT_TOKEN}`
            },
        });
    } catch (e) {
        console.error("Unable to send join message");
        console.error(e)
    }
}

// Write cookie for the state which will be used to compare later for the linked role stuff.
export const GET = (async ({ url, locals }) => {

    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    const clientState = locals.session.data.discord?.state;

    if (clientState !== state) {
        console.error('State verification failed.');

        await locals.session.update((data) => {
            data.error = "Backend error occured."
            return data;
        });
        return Response.redirect('/');
    }

    if (!code) {
        console.error('No code provided.');

        await locals.session.update((data) => {
            data.error = "Backend error occured."
            return data;
        });
        return Response.redirect('/');
    }

    console.log('Code received, getting tokens...')
    const tokens = await getOAuthTokens(code);

    const meData: DiscordData = await getUserData(tokens);
    console.log(`User ${meData.user.id} ${meData.user.username}#${meData.user.discriminator} has logged in using discord`);

    await locals.session.update((data) => {
        data.discord = {
            id: meData.user.id
        }
        return data;
    });

    const { result, error } = await setupUser(meData.user, tokens.access_token, locals.session.data.osu?.username ?? '');
    console.log(`User ${meData.user.id} ${meData.user.username}#${meData.user.discriminator} received: ${BotResult[result]}`);

    if (result === BotResult.Full) {
        await locals.session.update((data) => {
            data.error = "You have joined the maxmium amount of servers. Please leave a server before trying to rejoin this one."
            return data;
        });

        throw redirect(302, '/');
    } else if (result === BotResult.Error) {
        console.error(`Redirecting user due to API side error: ${error}`);
        await locals.session.update((data) => {
            data.error = "An unknown error occured while trying to join the server."
            return data;
        });

        throw redirect(302, '/');
    }

    sendMessageToWelcomeChannel.call(this, locals.session.data);

    console.log(`Discord User joined: ${meData.user.id} - ${meData.user.username}`);

    throw redirect(302, '/done');
}) satisfies RequestHandler;