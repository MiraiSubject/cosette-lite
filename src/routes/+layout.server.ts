import type { LayoutServerLoad } from './$types';
import { config } from '$lib/config'

export const load = (async ({ locals }) => {

	return {
        config,
		session: locals.session.data // You can also use your old `getSession` function if you wish.
	};
}) satisfies LayoutServerLoad;