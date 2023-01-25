import { handleSession } from 'svelte-kit-cookie-session';
import { PRIVATE_COOKIE_SECRET } from '$env/static/private'

console.log("Hello?")

export const first = handleSession({
	secret: `${PRIVATE_COOKIE_SECRET}`
});

export const handle = first