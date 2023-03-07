import { OSU2_CLIENT_SECRET } from '$env/static/private';
import { PUBLIC_OSU2_CALLBACK_URL, PUBLIC_OSU2_CLIENT_ID } from '$env/static/public';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

async function getOAuthTokens(code: string) {
    const url = 'https://osu.ppy.sh/oauth/token';
    const body = JSON.stringify({
        client_id: `${PUBLIC_OSU2_CLIENT_ID}`,
        client_secret: `${OSU2_CLIENT_SECRET}`,
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${PUBLIC_OSU2_CALLBACK_URL}`,
    });

    const response = await fetch(url, {
        body,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
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
    const url = 'https://osu.ppy.sh/api/v2/me';
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
    try {
        const code = url.searchParams.get('code');
        if (!code) throw new Error('No code provided');
        const tokens = await getOAuthTokens(code);
        const meData = await getUserData(tokens);
        
        await locals.session.set({
            osu: {
                id: meData.id,
                username: meData.username,
            }
        });

        return new Response(null, {
            status: 302,
            headers: {
                location: "/checks/discord"
            }
        });
    } catch (e) {
        console.error('Error parsing JSON', e);
        locals.session.set({
            error: "Error reading osu! profile data"
        });

        throw redirect(302, '/');
    }
}) satisfies RequestHandler;