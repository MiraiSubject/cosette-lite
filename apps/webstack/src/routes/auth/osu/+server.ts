import { env as pubEnv } from '$env/dynamic/public';
import type { RequestHandler } from './$types';

/**
 * Generate the url which the user will be directed to in order to approve the
 * bot, and see the list of requested scopes.
 */
function getOAuthUrl() {
    const url = new URL('https://osu.ppy.sh/oauth/authorize');
    url.searchParams.set('client_id', `${pubEnv.PUBLIC_OSU2_CLIENT_ID}`);
    url.searchParams.set('redirect_uri', `${pubEnv.PUBLIC_OSU2_CALLBACK_URL}`);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', 'identify');
    return url.toString();
}

// Write cookie for the state which will be used to compare later for the linked role stuff.
export const GET = (() => {

    const oauthUrl = getOAuthUrl();

    return Response.redirect(oauthUrl);
}) satisfies RequestHandler;