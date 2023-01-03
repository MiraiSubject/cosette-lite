import type { PageServerLoad } from './$types';
 
export const load = (async () => {
  return {
    name: "osu! Tournament Hub",
  };
}) satisfies PageServerLoad;