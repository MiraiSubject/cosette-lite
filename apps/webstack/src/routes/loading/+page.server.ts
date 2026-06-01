import { redirect } from '@sveltejs/kit';

export const load = async ({ locals }) => {
	if (!locals.session.data.osu?.id || !locals.session.data.discord?.id) {
		redirect(302, '/');
	}
};
