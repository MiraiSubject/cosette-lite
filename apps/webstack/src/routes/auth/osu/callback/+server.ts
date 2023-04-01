import { env } from '$env/dynamic/private';
import { env as pubEnv } from '$env/dynamic/public';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { DateTime } from "luxon";
import type { OsuUser } from '$lib/OsuUser';

async function getOAuthTokens(code: string) {
    const url = 'https://osu.ppy.sh/oauth/token';
    const body = JSON.stringify({
        client_id: `${pubEnv.PUBLIC_OSU2_CLIENT_ID}`,
        client_secret: `${env.OSU2_CLIENT_SECRET}`,
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${pubEnv.PUBLIC_BASE_URL}/auth/osu/callback`,
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

function isUserEligible(meData: OsuUser): boolean {
    const joinDate = DateTime.fromISO(meData.join_date);
    const nowMinus6Months = DateTime.now().minus({ months: 6 });

    return nowMinus6Months > joinDate;
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
                joinDate: DateTime.fromISO(meData.join_date)
            }
        });

        if (isUserEligible(meData)) {
            return new Response(null, {
                status: 302,
                headers: {
                    location: "/checks/discord"
                }
            });
        }

        await locals.session.update((data) => {
            data.error = `osu! account is not older than 6 months yet (account age is ${DateTime.fromISO(meData.join_date).toISODate()})`
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
