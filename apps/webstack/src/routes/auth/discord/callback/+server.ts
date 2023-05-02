import { env } from '$env/dynamic/private';
import { env as pubEnv } from '$env/dynamic/public';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { config } from 'config';
import { BotResult } from '$lib/BotResult';

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

interface DiscordData {
    application: Application;
    scopes: string[];
    expires: string;
    user: User;
}
interface Application {
    id: string;
    name: string;
    icon: string;
    description: string;
    hook: boolean;
    bot_public: boolean;
    bot_require_code_grant: boolean;
    verify_key: string;
}
interface User {
    id: string;
    username: string;
    avatar: string;
    discriminator: string;
    public_flags: number;
}

async function setupUser(user: User, token: string, nickname: string): Promise<BotResult> {
    try {
        const existsResponse = await userExistsInGuild(user.id)
        switch (existsResponse) {
            case MemberResult.Found: {
                const result = await addRoleToUser(user.id, config.discord.roles.map((val) => val.id), token, nickname);

                switch (result) {
                    case BotResult.Success:
                        return BotResult.Success
                    case BotResult.Error:
                    default:
                        return BotResult.Error
                }
            }
            default:
            case MemberResult.NotFound: {
                const joinResponse = await joinDiscordServer(user, token, nickname);
                switch (joinResponse) {
                    case BotResult.Success: {
                        const result = await addRoleToUser(user.id, config.discord.roles.map((val) => val.id), token, nickname);
                        switch (result) {
                            case BotResult.Success:
                                return BotResult.Success
                            default:
                                return BotResult.Error
                        }
                    }
                    case BotResult.Full:
                        return BotResult.Full
                    default:
                        return BotResult.Error
                }
            }
        }
    } catch (e) {
        console.log(e);
        return BotResult.Error
    }
}

async function joinDiscordServer(user: User, token: string, nickname: string): Promise<BotResult> {
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
                return BotResult.Full;
            }
            case 403:
            default:
                return BotResult.Error
        }

        return BotResult.Success;
    } catch (e) {
        console.log(e);
        return BotResult.Error;
    }
}

enum MemberResult {
    Found,
    NotFound,
    Error
}

async function userExistsInGuild(id: string): Promise<MemberResult> {
    try {
        const response = await fetch(`https://discord.com/api/v10/guilds/${config.discord.guildId}/members/${id}`, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bot ${env.DISCORD_BOT_TOKEN}`
            },
        });

        switch (response.status) {
            case 200:
                return MemberResult.Found
            case 404:
            default:
                return MemberResult.NotFound
        }
    } catch (e) {
        console.error(e);
        return MemberResult.Error
    }
}

async function addRoleToUser(userId: string, roles: string[], token: string, nick: string): Promise<BotResult> {
    const response = await fetch(`https://discord.com/api/v10/guilds/${config.discord.guildId}/members/${userId}`, {
        body: JSON.stringify({
            access_token: token,
            nick,
            roles: config.discord.roles.map((val) => val.id)
        }),
        method: 'PATCH',
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bot ${env.DISCORD_BOT_TOKEN}`
        },
    });

    console.log(response.status);

    switch (response.status) {
        case 200:
        case 204:
            return BotResult.Success
        case 400:
        case 404:
        default:
            return BotResult.Error
    }
}

async function sendMessageToWelcomeChannel(data: SessionData) {
    const body = JSON.stringify({
        embeds: [
            {
                "title": `${data.osu?.username} has joined the server!`,
                "color": 2458853,
                "timestamp": `${new Date().toISOString()}`,
                "thumbnail": {
                    "url": `https://a.ppy.sh/${data.osu?.id}?428927893258930.jpeg`
                },
                "author": {
                    "name": `User joined ${config.name}`,
                    "url": `${pubEnv.PUBLIC_BASE_URL}`
                }
            }
        ]
    })
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
        locals.session.update((data) => {
            data.error = "Backend error occured."
            return data;
        });
        return Response.redirect('/');
    }

    if (!code) {
        console.error('No code provided.');
        locals.session.update((data) => {
            data.error = "Backend error occured."
            return data;
        });
        return Response.redirect('/');
    }

    const tokens = await getOAuthTokens(code);

    const meData: DiscordData = await getUserData(tokens);

    const result: BotResult = await setupUser(meData.user, tokens.access_token, locals.session.data.osu?.username || '');

    if (result === BotResult.Full) {
        locals.session.update((data) => {
            data.error = "You have joined the maxmium amount of servers. Please leave a server before trying to rejoin this one."
            return data;
        });
        throw redirect(302, '/');
    } else if (result === BotResult.Error) {
        locals.session.update((data) => {
            data.error = "An unknown error occured while trying to join the server."
            return data;
        });
        throw redirect(302, '/');
    }

    sendMessageToWelcomeChannel.call(this, locals.session.data);

    console.log(`Discord User joined: ${meData.user.id} - ${meData.user.username}`);

    throw redirect(302, '/done');
}) satisfies RequestHandler;