import { env } from '$env/dynamic/private';
import { env as pubEnv } from '$env/dynamic/public';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { logger } from '$lib/logger';
import type { DiscordData } from '$lib/DiscordTypes';

async function getOAuthTokens(code: string) {
	const url = 'https://discord.com/api/v10/oauth2/token';
	const body = new URLSearchParams({
		client_id: `${pubEnv.PUBLIC_DISCORD_CLIENT_ID}`,
		client_secret: `${env.DISCORD_CLIENT_SECRET}`,
		grant_type: 'authorization_code',
		code,
		redirect_uri: `${pubEnv.PUBLIC_BASE_URL}/auth/discord/callback`
	});

	const response = await fetch(url, {
		body,
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		}
	});
	if (response.ok) {
		const data = await response.json();
		return data;
	} else {
		throw new Error(`Error fetching OAuth tokens: [${response.status}] ${response.statusText}`);
	}
}

async function getUserData(tokens: { access_token: string; token_type: string }) {
	const url = 'https://discord.com/api/v10/oauth2/@me';
	const response = await fetch(url, {
		headers: {
			Authorization: `Bearer ${tokens.access_token}`
		}
	});
	if (response.ok) {
		const data = await response.json();
		return data;
	} else {
		throw new Error(`Error fetching user data: [${response.status}] ${response.statusText}`);
	}
}

export const GET = (async ({ url, locals }) => {
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');

	const clientState = locals.session.data.discord?.state;

	if (clientState !== state) {
		logger.error('State verification failed.');

		await locals.session.update((data) => {
			data.error = 'Backend error occurred.';
			return data;
		});
		redirect(302, '/');
	}

	if (!code) {
		logger.error('No code provided.');

		await locals.session.update((data) => {
			data.error = 'Backend error occurred.';
			return data;
		});
		redirect(302, '/');
	}

	logger.info('Code received, getting tokens...');
	const tokens = await getOAuthTokens(code);

	const meData: DiscordData = await getUserData(tokens);
	logger.info(
		`User ${meData.user.id} ${meData.user.username}#${meData.user.discriminator} has logged in using discord`
	);

	await locals.session.update((data) => {
		if (!data.discord) data.discord = {};
		data.discord.id = meData.user.id;
		data.discord.accessToken = tokens.access_token;
		data.isReady = false;
		return data;
	});

	logger.info(`Prepared setup for user ${meData.user.username} ${meData.user.id}`);

	redirect(302, '/loading');
}) satisfies RequestHandler;
