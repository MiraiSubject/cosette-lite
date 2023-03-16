import type { PageServerLoad } from './$types';

export const load: PageServerLoad = (async ({ locals }) => {
  if (!locals.session.data.osu && !locals.session.data.reddit) {

    await locals.session.update((data) => {
      data.error = "Something went wrong with setting the cookie. Please try again or try a different browser."
      return data;
    })

    return {
      status: 302,
      headers: {
        location: "/"
      }
    }
  }

  return {
    osuUsername: locals.session.data.osu?.username,
    osuId: locals.session.data.osu?.id,
    redditUsername: locals.session.data.reddit?.username
  }
}) satisfies PageServerLoad;