import { deepFreeze } from '../../utils/scripts';

export const UI = deepFreeze({
	RESOURCES: {
		getSymbol: symbol => `/assets/coin-logos/${symbol}.png`,
	},
	LIQ_BACKGROUND: {
		background:
			'radial-gradient(circle, rgba(38,41,50,1) 0%, rgba(88,40,47,1) 90%, rgba(121,40,45,1) 95%, rgba(220,38,38,0.4) 100%)',
	},
	SIDE_COLOR: {
		Bid: 'text-green-400',
		Ask: 'text-red-400',
	},
	FLASH: {
		ACTIVE: Number(process.env.NEXT_PUBLIC_FLASH) !== 0,
		LIMIT_TRADE: 5,
		LIMIT_ORDER: 12,
		TIMEOUT: 200,
	},
	TOAST: {
		AUTOCLOSE: {
			SHORT: 2000,
			DEFAULT: 3000,
			LONG: 5000,
			LONGER: 7000,
			LONGEST: 10000,
		},
	},
});
