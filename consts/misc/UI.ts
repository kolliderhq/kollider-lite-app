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
	TOAST: {
		AUTOCLOSE: {
			SHORT: 2000,
			DEFAULT: 3000,
			LONG: 5000,
			LONGER: 7000,
			LONGEST: 10000,
		},
	},
	DENOM: {
		SATS: {
			VALUE: 'SATS',
			MULT: 1,
		},
		BTC: {
			VALUE: 'BTC',
			MULT: Math.pow(10, -8),
			DECIMALS: 7,
		},
		USD: {
			VALUE: 'USD',
			MULT: null, //  need realtime data for this
			DECIMALS: 3,
		},
	},
});

export enum TABS {
	ORDER,
	POSITIONS,
	RANKS,
	__LENGTH,
}

// dependant on UI actions
export enum DIALOGS {
	NONE,
	LOGIN,
	CLOSE_POSITION,
	SWEEP_WALLET,
	CHANGE_MARGIN_INVOICE,
	SETTLE_INVOICE,
	SETTINGS,
	MAKE_ORDER,
	CONTRACT_INFO,
	QUANTITY_TOUCH_INPUT,
}

// stuff that is triggered and suddenly appear
export enum POPUPS {
	NONE,
	INVOICE,
	WELCOME,
}
