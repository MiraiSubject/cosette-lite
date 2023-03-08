import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET = (async ({ locals }) => {
    await locals.session.destroy();
    throw redirect(302, '/');
}) satisfies RequestHandler