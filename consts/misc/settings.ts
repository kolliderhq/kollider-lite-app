import { TIME } from 'consts/time';
import { deepFreeze } from 'utils/scripts';

const K = 1000;
export const SETTINGS = deepFreeze({
	LIMITS: {
		UI_UPDATE_INTERVAL: 300,
		WITHDRAW_LIMIT: 1000000000000 * K,
		NUMBER: 10000 * K,
		MARGIN_LIMIT: 10000 * K,
		INVOICE: TIME.MINUTE * 2,
		TRADE_TABLE_MAX: 25,
		TOKEN_PERSIST: TIME.HOUR * 12,
		JWT_REQUEST_THRESHOLD: process.env.NEXT_PUBLIC_LOCAL_DEV === '2' ? TIME.MINUTE : TIME.MINUTE * 5,
		REQUEST_TRADES: 3 * K,
		MAX_TIME_RANGE_TRADES_DIFF_MS: TIME.HOUR * 24 * 3,
		MAX_TIME_RANGE_DEPOSITS_DIFF_MS: TIME.HOUR * 24 * 60,
		ORDER_PREDICTION_STALE: TIME.SECOND * 10,
		WEBLN_WITHDRAW_TIMEOUT_MS: 500,
	},
	OHLC_INTERVALS: ['1m', '5m', '15m', '1d'],
	OHLC_TIMESPANS: [TIME.MINUTE, TIME.MINUTE * 5, TIME.MINUTE * 15, TIME.HOUR * 24],
	DASHBOARD_INTERVALS: ['1m', '5m', '30m', '1h', '4h', '1d'],
	DASHBOARD_TIMESPANS: [TIME.MINUTE, TIME.MINUTE * 5, TIME.MINUTE * 30, TIME.HOUR, TIME.HOUR * 4, TIME.HOUR * 24],
	DASHBOARD_POINTS: 96,

	FEEDBACK_FISH_ID: 'e44bff642382f1',

	STEPS: {
		100: {
			0: {
				value: 1,
			},
			120: {
				value: 2,
			},
			250: {
				value: 3,
			},
			400: {
				value: 5,
			},
			550: {
				value: 10,
			},
			700: {
				value: 25,
			},
			850: {
				value: 50,
			},
			1000: {
				value: 100,
			},
		},
		50: {
			0: {
				value: 1,
			},
			120: {
				value: 2,
			},
			250: {
				value: 3,
			},
			400: {
				value: 5,
			},
			550: {
				value: 10,
			},
			700: {
				value: 25,
			},
			850: {
				value: 35,
			},
			1000: {
				value: 50,
			},
		},
		25: {
			0: {
				value: 1,
			},
			120: {
				value: 2,
			},
			240: {
				value: 3,
			},
			380: {
				value: 5,
			},
			550: {
				value: 10,
			},
			700: {
				value: 15,
			},
			850: {
				value: 20,
			},
			1000: {
				value: 25,
			},
		},
	},
});
