import { DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET } from '$env/static/private';
import { PUBLIC_DISCORD_CALLBACK_URL } from '$env/static/public';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

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

    const meData = await getUserData(tokens);
    console.log(`Discord User joined: ${meData.user.id} - ${meData.user.username}`);

    throw redirect(302, '/done');
}) satisfies RequestHandler;