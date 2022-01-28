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
export const makeOrder = (obj: OrderTemplate) => {
	return {
		quantity: Number(obj?.quantity),
		leverage: obj?.leverage * 100,
		order_type: 'Market',
		margin_type: 'Isolated',
		// price: obj?.price ? Number(multiply(obj?.price, Math.pow(10, obj?.priceDp))) : 1,
		price: obj?.price ? Number(multiply(obj?.price, Math.pow(10, obj.priceDp), 0)) : 1,
		settlement_type: 'Instant',
		side: obj?.side,
		ext_order_id: uuidv4(),
		symbol: obj?.symbol,
		timestamp: 0,
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
