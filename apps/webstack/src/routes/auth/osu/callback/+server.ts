import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { isUserEligible } from 'config';
import type { OsuUser } from '$lib/OsuUser';
import { getOsuOAuthTokens, getOsuUserData } from '$lib/osu';

// Write cookie for the state which will be used to compare later for the linked role stuff.
export const GET = (async ({ url, locals }) => {
    try {
        const code = url.searchParams.get('code');
        const state = url.searchParams.get('state');
        const sessionState = locals.session.data.osu?.state;

        if (sessionState !== state) {
            await locals.session.set({ error: "Invalid state. Please try again." });
            redirect(302, '/');
        }

        if (!code) throw new Error('No code provided');
        const tokens = await getOsuOAuthTokens(code);
        const meData = await getOsuUserData(tokens) as OsuUser;

        await locals.session.set({
            osu: {
                id: meData.id.toString(),
                username: meData.username,
                joinDate: new Date(meData.join_date),
            },
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
            if (!data.osu) {
                data.error = "Error reading osu! profile data"
                return data;
            }

            data.error = `osu! account is not older than 6 months yet (account age is ${data.osu.joinDate?.toUTCString() ?? 'unknown'})`
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

        redirect(302, '/');
    }
}) satisfies RequestHandler;
