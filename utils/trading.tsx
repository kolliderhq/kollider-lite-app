import { v4 as uuidv4 } from 'uuid';

import { multiply } from 'utils/Big';

export interface OrderTemplate {
	leverage: number;
	quantity: string;
	orderType: string;
	price: string;
	side: string;
	symbol: string;
	priceDp: number;
	localSave?: string;
}

export interface AdvancedOrderTemplate {
	leverage: number;
	quantity: string;
	orderType: string;
	price: string;
	side: string;
	symbol: string;
	priceDp: number;
	advancedOrderType: string,
	triggerPriceType: string,
	localSave?: string;
}

export interface CancelAdvancedOrderTemplate {
	orderId: number,
	symbol: string,
}

export const makeOrder = (obj: OrderTemplate) => {
	let appOrigin;
	if (process.env.NEXT_PUBLIC_UMBREL === '1') {
		appOrigin = "UmbrelLite"
	} else {
		appOrigin = "Lite"
	}
	return {
		quantity: Number(obj?.quantity),
		leverage: Number((obj?.leverage * 100).toFixed(0)),
		order_type: 'Market',
		margin_type: 'Isolated',
		// price: obj?.price ? Number(multiply(obj?.price, Math.pow(10, obj?.priceDp))) : 1,
		price: obj?.price ? Number(multiply(obj?.price, Math.pow(10, obj.priceDp), 0)) : 1,
		settlement_type: 'Instant',
		side: obj?.side,
		ext_order_id: uuidv4(),
		symbol: obj?.symbol,
		timestamp: 0,
		origin: appOrigin,
	};
};

export const makeAdvancedOrder = (obj: AdvancedOrderTemplate) => {
	return {
		quantity: Number(obj?.quantity),
		leverage: Number((obj?.leverage * 100).toFixed(0)),
		order_type: 'Market',
		margin_type: 'Isolated',
		price: obj?.price ? Number(multiply(obj?.price, Math.pow(10, obj.priceDp), 0)) : 1,
		settlement_type: 'Instant',
		side: obj?.side,
		ext_order_id: uuidv4(),
		symbol: obj?.symbol,
		timestamp: 0,
		advanced_order_type: obj?.advancedOrderType,
		trigger_price_type: obj?.triggerPriceType,
		origin: "Lite",
	};
};

export const makeCancelAdvancedOrder = (obj: CancelAdvancedOrderTemplate) => {
	return {
		order_id: obj?.orderId,
	};
};

export interface ProcessedOrder {
	quantity: number;
	leverage: number;
	order_type: string;
	margin_type: string;
	price: number;
	settlement_type: string;
	side: string;
	ext_order_id: string;
	symbol: string;
	timestamp: number;
}
