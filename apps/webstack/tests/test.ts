import { expect, test } from '@playwright/test';

test('index page has expected h1', async ({ page }) => {
	await page.goto('/');
	const h1 = await page.textContent('h1');
	expect(h1).toContain('Welcome to');
	expect(h1).toContain('verification');
});
