import { DISCORD_BOT_TOKEN, DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET } from '$env/static/private';
import { PUBLIC_DISCORD_CALLBACK_URL } from '$env/static/public';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { config } from '../../../../../../../packages/config/config';

async function getOAuthTokens(code: string) {
    const url = 'https://discord.com/api/v10/oauth2/token';
    const body = new URLSearchParams({
        client_id: `${DISCORD_CLIENT_ID}`,
        client_secret: `${DISCORD_CLIENT_SECRET}`,
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${PUBLIC_DISCORD_CALLBACK_URL}`,
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

async function joinDiscordServer(user: User, token: string, nickname: string): Promise<number> {
    try {
        const response = await fetch(`https://discord.com/api/guilds/${config.discord.guildId}/members/${user.id}`, {
            body: JSON.stringify({
                access_token: token
            }),
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bot ${DISCORD_BOT_TOKEN}`
            },
        });

        switch (response.status) {
            case 201:
                console.log(`Joined ${user.id} to server!`);
                break;
            case 204:
                console.log(`User is already in the guild.`);
                break;
            case 400: {
                console.log(`${user.id} - ${user.username} has reached maximum guilds, checking if user is present in guild...`);
                //tRPC call to check whether guildmember exists
                const exists = true;
                if (exists) {
                    break;
                } else {
                    return 1;
                }
            }
        }

        // Perform IPC (or tRPC) request to bot to add roles
    } catch (e) {
        console.log(e);
    }
}


// Write cookie for the state which will be used to compare later for the linked role stuff.
export const GET = (async ({ url, locals }) => {

    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    const clientState = locals.session.data.discord?.state;

    if (clientState !== state) {
        console.error('State verification failed.');
        locals.session.data.error = "Backend error occured."
        return Response.redirect('/');
    }

    if (!code) {
        console.error('No code provided.');
        locals.session.data.error = "Backend error occured."
        return Response.redirect('/');
    }

    const tokens = await getOAuthTokens(code);

    const meData: DiscordData = await getUserData(tokens);

    await joinDiscordServer(meData.user, tokens.access_token, locals.session.data.osu?.username || '');

    console.log(`Discord User joined: ${meData.user.id} - ${meData.user.username}`);

    throw redirect(302, '/done');
}) satisfies RequestHandler;