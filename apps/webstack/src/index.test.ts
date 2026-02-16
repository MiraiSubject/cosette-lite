import { describe, it, expect } from 'vitest';
import { isUserEligible } from 'config';

describe('isUserEligible', () => {
	it('returns false for user who joined less than 6 months ago', () => {
		const recentUser = { join_date: new Date().toISOString().slice(0, 10) };
		expect(isUserEligible(recentUser as Parameters<typeof isUserEligible>[0])).toBe(false);
	});

	it('returns true for user who joined more than 6 months ago', () => {
		const oldDate = new Date();
		oldDate.setMonth(oldDate.getMonth() - 7);
		const oldUser = { join_date: oldDate.toISOString().slice(0, 10) };
		expect(isUserEligible(oldUser as Parameters<typeof isUserEligible>[0])).toBe(true);
	});
});
