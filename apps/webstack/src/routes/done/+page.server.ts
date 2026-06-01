export const load = async ({ locals }) => {
	await locals.session.destroy();
};
