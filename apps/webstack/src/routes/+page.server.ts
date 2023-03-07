import type { PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
  if (locals.session.data.error) {
    return {
      error: locals.session.data.error
    }
  }
}) satisfies PageServerLoad;