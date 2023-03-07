import { sveltekit } from '@sveltejs/kit/vite';

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	},
	server: {
		port: 8000,
		strictPort: false,
	},
	preview: {
		port: 4173,
		strictPort: false,
	}
};

export default config;
