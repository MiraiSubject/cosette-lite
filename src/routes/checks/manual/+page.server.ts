import type { PageServerLoad } from './$types';
 
export const load = (async () => {
  return {
    reason: "You are not logged in.",
  };
}) satisfies PageServerLoad;