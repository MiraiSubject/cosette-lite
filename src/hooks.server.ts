import { handleSession } from 'svelte-kit-cookie-session';
import { PRIVATE_COOKIE_SECRET } from '$env/static/private'
import { sequence } from "@sveltejs/kit/hooks";
import type { Handle } from "@sveltejs/kit";
// You can do it like this, without passing a own handle function
export const first = handleSession({
	// Optional initial state of the session, default is an empty object {}
	// init: (event) => ({
	// 	views: 0
	// }),
	secret: `${PRIVATE_COOKIE_SECRET}`
});

console.log("Hello");

export const second = (async ({ event, resolve }) => {
	// container.resolve(DiscordBot);
	return await resolve(event);
}) satisfies Handle

export const handle = sequence(first, second);