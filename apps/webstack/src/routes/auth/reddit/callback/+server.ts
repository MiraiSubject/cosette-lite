import { env } from '$env/dynamic/private';
import { env as pubEnv } from '$env/dynamic/public';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { DateTime } from "luxon";

async function getOAuthTokens(code: string) {
    const url = 'https://www.reddit.com/api/v1/access_token';
    const body = {
        client_id: `${pubEnv.PUBLIC_REDDIT_CLIENT_ID}`,
        client_secret: `${env.PRIVATE_REDDIT_CLIENT_SECRET}`,
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${pubEnv.PUBLIC_REDDIT_CALLBACK_URL}`,
    };

    const response = await fetch(url, {
        body: new URLSearchParams(body).toString(),
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            "Authorization": "Basic " + Buffer.from(`${pubEnv.PUBLIC_REDDIT_CLIENT_ID}:${env.PRIVATE_REDDIT_CLIENT_SECRET}`).toString("base64"),
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
    const url = 'https://oauth.reddit.com/api/v1/me';
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

        console.log(meData);

        const joinDate = DateTime.fromSeconds(meData.created);

        await locals.session.update((data) => {
            data.reddit = {
                username: meData.name,
            }
            return data;
        });

        const threshold = DateTime.fromISO("2023-03-13T00:00:00.000Z")

        if (threshold > joinDate) {
            return new Response(null, {
                status: 302,
                headers: {
                    location: "/checks/discord"
                }
            });
        }

        await locals.session.update((data) => {
            data.error = `Reddit is created after the threshold (account age is ${joinDate.toISODate()})`
            return data;
        });

        return new Response(null, {
            status: 302,
            headers: {
                location: "/checks/manual"
            }
        })
    } catch (e) {
        console.error('Error parsing JSON', e);
        locals.session.set({
            error: "Error reading osu! profile data"
        });

        throw redirect(302, '/');
    }
}) satisfies RequestHandler;
