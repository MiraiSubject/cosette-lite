import type { PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
  if (locals.session.data.osu) {
    return {
      reason: locals.session.data.error
    };
  }
}) satisfies PageServerLoad;