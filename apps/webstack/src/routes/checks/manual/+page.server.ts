import type { PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
  if (locals.session.data.reason) {
    return {
      reason: locals.session.data.reason
    };
  }
}) satisfies PageServerLoad;