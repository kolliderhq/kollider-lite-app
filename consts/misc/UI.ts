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
});

export enum TABS {
	ORDER_INFO,
	POSITIONS,
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
}

// stuff that is triggered and suddenly appear
export enum POPUPS {
	NONE,
	INVOICE,
}
