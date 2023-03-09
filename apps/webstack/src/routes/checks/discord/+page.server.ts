import type { PageServerLoad } from './$types';

export const load: PageServerLoad = (async ({ locals }) => {
  if (!locals.session.data.osu) {
    return {
      status: 302,
      headers: {
        location: "/auth/osu"
      }
    }
  }

  return {
    username: locals.session.data.osu.username,
    osuId: locals.session.data.osu.id
  }
}) satisfies PageServerLoad;