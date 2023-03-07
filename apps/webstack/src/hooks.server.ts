import { handleSession } from 'svelte-kit-cookie-session';
import { PRIVATE_COOKIE_SECRET } from '$env/static/private'

export const first = handleSession({
	secret: `${PRIVATE_COOKIE_SECRET}`
});

export const handle = first