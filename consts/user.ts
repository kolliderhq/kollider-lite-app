import { DeepReadonly } from 'ts-essentials';

import { deepFreeze } from '../utils/scripts';

const K = 1000;
enum USER_TYPES {
	NULL = 'NULL',
	LIGHT = 'light',
	PRO = 'pro',
	BUSINESS = 'business',
}
const USER_SETTINGS: DeepReadonly<Record<string, { MARGIN_LIMIT: number; CASH_LIMIT: number }>> = deepFreeze(
	process.env.NEXT_PUBLIC_BACK_ENV === 'production'
		? {
				[USER_TYPES.LIGHT]: {
					MARGIN_LIMIT: 100 * K,
					CASH_LIMIT: 100 * K,
				},
				[USER_TYPES.PRO]: {
					MARGIN_LIMIT: 1500 * K,
					CASH_LIMIT: 1500 * K,
				},
				[USER_TYPES.NULL]: {
					MARGIN_LIMIT: 1,
					CASH_LIMIT: 1,
				},
		  }
		: {
				[USER_TYPES.LIGHT]: {
					MARGIN_LIMIT: 10000 * K,
					CASH_LIMIT: 10000 * K,
				},
				[USER_TYPES.PRO]: {
					MARGIN_LIMIT: 10000 * K,
					CASH_LIMIT: 10000 * K,
				},
				[USER_TYPES.NULL]: {
					MARGIN_LIMIT: 1,
					CASH_LIMIT: 1,
				},
		  }
);

export { USER_SETTINGS, USER_TYPES };
