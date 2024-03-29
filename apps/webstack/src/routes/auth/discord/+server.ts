import type { RequestHandler } from './$types';
import { env as pubEnv } from '$env/dynamic/public';
import { redirect } from '@sveltejs/kit';

/**
 * Generate the url which the user will be directed to in order to approve the
 * bot, and see the list of requested scopes.
 */
function getOAuthUrl() {
    const state = crypto.randomUUID();

    const url = new URL('https://discord.com/api/oauth2/authorize');
    url.searchParams.set('client_id', `${pubEnv.PUBLIC_DISCORD_CLIENT_ID}`);
    url.searchParams.set('redirect_uri', `${pubEnv.PUBLIC_BASE_URL}/auth/discord/callback`);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('state', state);
    url.searchParams.set('scope', 'guilds.join identify');
    url.searchParams.set('prompt', 'consent');
    return { state, url: url.toString() };
}

// Write cookie for the state which will be used to compare later for the linked role stuff.
export const GET = (async ({ locals }) => {
    if (!(locals.session.data.osu?.id || locals.session.data.osu?.username)) {
        locals.session.set({
            error: "Error saving data to cookie, please delete the cookies for this site and clear the cache."
        });

        throw redirect(302, '/');
    }

    const { state, url } = getOAuthUrl();

    await locals.session.update((data) => {
        data.discord = {
            state: state
        };
        return data;
    });

    return new Response(null, {
        headers: {
            Location: url,
        },
        status: 302
    });
}) satisfies RequestHandler;