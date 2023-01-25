import type { PageServerLoad } from './$types';
 
console.log("Index page gets loaded")

export const load = (async ({ locals }) => {
  if (locals.session.data.error) {
    return {
      error: locals.session.data.error
    }
  }
  // return {
  //   name: "osu! Tournament Hub",
  // };
}) satisfies PageServerLoad;