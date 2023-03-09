import { handleSession } from 'svelte-kit-cookie-session';
import { env } from '$env/dynamic/private'

export const first = handleSession({
	secret: `${env.PRIVATE_COOKIE_SECRET}`
});

export const handle = first