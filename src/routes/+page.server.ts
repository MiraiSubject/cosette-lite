import type { ITournamentConfig } from '$lib/config.interface';
import { readFile } from 'fs/promises';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
  const res: ITournamentConfig = JSON.parse(await readFile('./config.json', 'utf-8'));

  const output: {
    name: string,
    session?: SessionData
  } = {
    name: res.name
  }

  if (locals.session) {
    output.session = locals.session.data
  }

  return output;
}) satisfies PageServerLoad;