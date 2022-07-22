import each from 'lodash-es/each';
import keys from 'lodash-es/keys';

import { OrderTemplate, makeOrder, makeAdvancedOrder, AdvancedOrderTemplate, makeCancelAdvancedOrder, CancelAdvancedOrderTemplate } from 'utils/trading';

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
		// back = 'ws://api.staging.kollider.internal/v1/ws/';
	} else {
		back = 'ws://api.staging.kollider.internal/v1/ws/';
	}
}

export const SOCKET_END_POINTS = Object.freeze({ BACK: back });

const UMBREL_URL = {
	DEV: 'ws://localhost:8080',
	// PROD: 'ws://localhost:8080',
	PROD: 'ws://' + location.host + ':4244',
};

export const WS_UMBREL = {
	BASE: process.env.NEXT_PUBLIC_BACK_ENV === 'production' ? UMBREL_URL.PROD : UMBREL_URL.DEV,
	MESSAGES: {
		CREATE_INVOICE: {
			type: 'createInvoice',
			returnType: 'createInvoice',
			createBody: (params: any) => ({ ...params }),
		},
		SEND_PAYMENT: {
			type: 'sendPayment',
			returnType: 'sendPayment',
			createBody: (params: any) => ({ ...params }),
		},
		AUTHENTICATION: {
			type: 'authentication',
			returnType: 'authentication',
			createBody: (params: any) => ({ ...params }),
		},
		GET_NODE_INFO: {
			type: 'getNodeInfo',
			returnType: 'getNodeInfo',
		},
		GET_CHANNEL_BALANCE: {
			type: 'getChannelBalances',
			returnType: 'getChannelBalances',
		},
		GET_WALLET_BALANCE: {
			type: 'getWalletBalances',
			returnType: 'getWalletBalances',
		},
		AUTH_LNURL: {
			type: 'lnurlAuth',
			returnType: 'lnurlAuth',
		},
	},
};

const UMBREL_MESSAGE_TYPES = {} as Record<string, any>;
each(keys(WS_UMBREL.MESSAGES), v => (UMBREL_MESSAGE_TYPES[v] = v));
export { UMBREL_MESSAGE_TYPES };

export const CHANNEL_OPTIONS = {
	ORDERBOOK_LEVEL2: {
		customType: 'level2state',
	},
};

export enum CHANNELS {
	TICKER = 'ticker',
	ORDERBOOK_LEVEL2 = 'orderbook_level2',
	INDEX_VALUES = 'index_values',
	FUNDING_RATES = 'funding_rates',
	MARK_PRICE = 'mark_prices',
	POSITION_STATES = 'position_states',
	BALANCES = 'balances', //	not really a channel but processed at the same place
}

export enum TRADING_TYPES {
	FILL = 'fill',
	TRADE = 'trade',
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
	ADVANCED_ORDER_OPEN = 'advanced_order_open',
	ADVANCED_ORDER_DONE = 'advanced_order_done',
	USER_ADVANCED_ORDERS = 'user_advanced_orders',
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

export enum UNUSED_TRADING_TYPES {
	OPEN_ORDERS = 'open_orders',
	USER_ADVANCED_ORDERS = 'user_advanced_orders', //	 also in advanced orders
}

export const WS: IWS = Object.freeze({
	END_POINTS: SOCKET_END_POINTS,
	MESSAGES: {
		ORDER: {
			type: 'order',
			createBody: (input: OrderTemplate) => ({ ...makeOrder(input) }),
		},
		ADVANCED_ORDER: {
			type: 'order',
			createBody: (input: AdvancedOrderTemplate) => ({ ...makeAdvancedOrder(input) }),
		},
		CANCEL_ADVANCED_ORDER: {
			type: 'cancel_advanced_order',
			createBody: (input: CancelAdvancedOrderTemplate) => ({ ...makeCancelAdvancedOrder(input) }),
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
		OPEN_ORDERS: {
			type: 'fetch_open_orders',
			createBody: params => ({ ...params }),
		},
		ADVANCED_ORDERS: {
			type: 'fetch_user_advanced_orders',
			createBody: () => ({}),
			refineType: 'user_advanced_orders',
		},
	},
	CHANNELS,
});

const MESSAGE_TYPES = {} as Record<string, string>;
each(keys(WS.MESSAGES), v => (MESSAGE_TYPES[v] = v));
export { MESSAGE_TYPES };
