import each from 'lodash-es/each';
import keys from 'lodash-es/keys';
import { v4 as uuidv4 } from 'uuid';

import { OrderTemplate, makeOrder } from '../utils/trading';

let back: string;
if (process.env.NEXT_PUBLIC_LOCAL_DEV === '1') {
	back = 'ws://127.0.0.1:8084/';
} else if (process.env.NEXT_PUBLIC_LOCAL_DEV === '2') {
	back = 'ws://api.test.kollider.internal/v1/ws/';
} else if (process.env.NEXT_PUBLIC_LOCAL_DEV === '3') {
	back = 'ws://api.test.kollider.internal/v1/ws/';
} else {
	if (process.env.NEXT_PUBLIC_LOCAL_PROD === '1') {
		back = 'ws://10.0.2.213/v1/ws/';
	} else if (process.env.NEXT_PUBLIC_BACK_ENV === 'production') {
		back = 'wss://api.kollider.xyz/v1/ws/';
	} else {
		back = 'ws://api-staging-perps.kollider.internal/v1/ws/';
	}
}

export const SOCKET_END_POINTS = Object.freeze({ BACK: back });

export const CHANNEL_OPTIONS = {
	ORDERBOOK_LEVEL2: {
		customType: 'level2state',
	},
};

export enum CHANNELS {
	TICKER = 'ticker',
	ORDERBOOK_LEVEL2 = 'orderbook_level2',
	INDEX_VALUES = 'index_values',
	MARK_PRICE = 'mark_prices',
	POSITION_STATES = 'position_states',
	BALANCES = 'balances', //	not really a channel but processed at the same place
}

export enum TRADING_TYPES {
	FILL = 'fill',
	TRADE = 'trade',
	MATCH = 'match',
	ORDER_REJECTION = 'order_rejection',
	LIQUIDITY_BUILDING = 'liquidity_building',
	DONE = 'done',
	LIQUIDATIONS = 'liquidations',
	RECEIVED = 'received',
	ORDER_INVOICE = 'order_invoice',
	SETTLEMENT_REQUEST = 'settlement_request',
	DEPOSIT_REJECTION = 'deposit_rejection',
	DEPOSIT_SUCCESS = 'deposit_success',
	RAW_DEPOSIT = 'raw_deposit',
	WITHDRAWAL_SUCCESS = 'withdrawal_success',
	WITHDRAWAL_REJECTION = 'withdrawal_rejection',
	LNURL_WITHDRAWAL_REQUEST = 'lnurl_withdrawal_request',
	RAW_WITHDRAWAL = 'raw_withdrawal',
	ADL_NOTICE = 'adl_notice',
	WITHDRAWAL_LIMIT_INFO = 'withdrawal_limit_info',
}

export enum WS_CUSTOM_TYPES {
	LNURL_AUTH_CREDENTIALS = 'lnurl_auth_credentials',
	SUSPENDED_SYMBOL = 'suspended_symbol',
	SERVICE_STATUS_REPORT = 'service_status_report',
}

interface IWS {
	END_POINTS: typeof SOCKET_END_POINTS;
	MESSAGES: Record<
		string,
		{
			type: string;
			createBody?: (params: any) => any;
			refineType?: string;
			requiredBodyParams?: string[];
		}
	>;
	CHANNELS: typeof CHANNELS;
}

export const WS: IWS = Object.freeze({
	END_POINTS: SOCKET_END_POINTS,
	MESSAGES: {
		ORDER: {
			type: 'order',
			createBody: (input: OrderTemplate) => ({ ...makeOrder(input) }),
		},
		SUBSCRIBE: {
			type: 'subscribe',
			createBody: (params: any) => ({ ...params }),
			requiredBodyParams: ['channels', 'symbols'],
		},
		UNSUBSCRIBE: {
			type: 'unsubscribe',
			createBody: (params: any) => ({ ...params }),
			requiredBodyParams: ['channels', 'symbols'],
		},
		AUTHENTICATE: {
			type: 'authenticate',
			createBody: (params: any) => ({ ...params }),
			requiredBodyParams: ['token'],
		},
		POSITIONS: {
			type: 'fetch_positions',
			createBody: (params: any) => ({ ...params }),
			refineType: 'positions',
		},
		BALANCES: {
			type: 'fetch_balances',
			createBody: (params: any) => ({ ...params }),
		},
		PRICE_TICKER: {
			type: 'fetch_price_ticker',
			createBody: (params: any) => ({ ...params }),
		},
		SETTLEMENT_REQUEST: {
			type: 'settlement_request',
		},
		WITHDRAWAL_REQUEST: {
			type: 'withdrawal_request',
			createBody: (params: any) => {
				if (params?.invoice)
					return {
						withdrawal_request: {
							Ln: {
								payment_request: params?.invoice,
								amount: params?.amount,
							},
						},
					};
				else
					return {
						withdrawal_request: {
							Ln: {
								amount: params?.amount,
							},
						},
					};
			},
		},
		LOGOUT: {
			type: 'logout',
			createBody: () => ({}),
		},
		WITHDRAWAL_LIMIT_INFO: {
			type: 'fetch_withdrawal_limit_info',
			createBody: () => ({}),
		},
	},
	CHANNELS,
});

const MESSAGE_TYPES = {} as Record<string, string>;
each(keys(WS.MESSAGES), v => (MESSAGE_TYPES[v] = v));
export { MESSAGE_TYPES };
