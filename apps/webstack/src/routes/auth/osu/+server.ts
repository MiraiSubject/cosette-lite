import { redirect } from '@sveltejs/kit';
import { env as pubEnv } from '$env/dynamic/public';
import type { RequestHandler } from './$types';

function getOAuthUrl(state: string) {
    const url = new URL('https://osu.ppy.sh/oauth/authorize');
    url.searchParams.set('client_id', `${pubEnv.PUBLIC_OSU2_CLIENT_ID}`);
    url.searchParams.set('redirect_uri', `${pubEnv.PUBLIC_BASE_URL}/auth/osu/callback`);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', 'identify');
    url.searchParams.set('state', state);
    return url.toString();
}

// Write cookie for the state which will be used to compare later for the linked role stuff.
export const GET = (async ({ locals }) => {
    const state = crypto.randomUUID();

    await locals.session.update((data) => {
        data.osu = { ...(data.osu ?? {}), state };
        return data;
    });

    redirect(302, getOAuthUrl(state));
}) satisfies RequestHandler;