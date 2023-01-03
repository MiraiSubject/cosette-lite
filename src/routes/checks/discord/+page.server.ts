import type { ITournamentConfig } from '$lib/config.interface';
import { readFile } from 'fs/promises';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = (async ({ locals }) => {

  const res: ITournamentConfig = JSON.parse(await readFile('./config.json', 'utf-8'));

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
    osuId: locals.session.data.osu.id,
    roles: res.discord.roles.map(item => item.name),
    session: locals.session.data
  }
}) satisfies PageServerLoad;