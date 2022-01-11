import React from 'react';

import empty from 'is-empty';
import capitalize from 'lodash-es/capitalize';
import each from 'lodash-es/each';
import isFunction from 'lodash-es/isFunction';
import keys from 'lodash-es/keys';
import lowerCase from 'lodash-es/lowerCase';
import map from 'lodash-es/map';

import {
	CHANNELS,
	CHANNEL_OPTIONS,
	MESSAGE_TYPES,
	TRADING_TYPES,
	UNUSED_TRADING_TYPES,
	WS,
	WS_CUSTOM_TYPES,
} from 'consts/websocket';
import { LOG3, LOG5 } from 'utils/debug';
import { mapKeyValues } from 'utils/scripts';
import { TOAST_LEVEL, displayToast } from 'utils/toast';

import { add, divide } from '../Big';
import { createAccumulatedArray, sortObjByKeys } from '../complexSort';
import { CustomError } from '../error';
import { camelCaseAllKeys, toNormalCase } from '../format';
import { parseTime } from '../time';
import { KeysToCamelCase } from '../types/utils';

const refiner = new Map();

interface SocketMsgWrapper {
	seq: number;
	type: string;
}

refiner.set('success', v => {
	return v;
});

refiner.set(WS_CUSTOM_TYPES.SERVICE_STATUS_REPORT, (data: { data: { status: string } }) => {
	LOG3(data, 'SERVICE_STATUS_REPORT');
	if (data.data.status === 'NotRunning') {
		// TODO : do something to the UI
	}
	return data;
});

refiner.set(WS_CUSTOM_TYPES.SUSPENDED_SYMBOL, v => {
	LOG3(v, 'SUSPENDED_SYMBOL');
	if (v.data?.msg) {
		// TODO : do something to the UI
	}
	// msg
	return v;
});

refiner.set(WS_CUSTOM_TYPES.LNURL_AUTH_CREDENTIALS, v => {
	LOG3(v, 'LNURL_AUTH_CREDENTIALS');
	return { ...v, data: camelCaseAllKeys(v.data) };
});

//  trading related types
refiner.set(TRADING_TYPES.TRADE, v => {
	LOG3(v.data, 'Trade');
	const data = v.data;
	return {
		...v,
		data: {
			fees: data.fees,
			isLiquidation: data.is_liquidation,
			isMaker: data.is_maker,
			leverage: data.leverage,
			marginType: data.margin_type,
			orderId: data.order_id,
			orderType: data.order_type,
			price: data.price,
			quantity: data.quantity,
			rpnl: data.rpnl,
			settlementType: data.settlement_type,
			side: data.side,
			symbol: data.symbol,
			timestamp: parseTime(data.timestamp),
			rawTime: data.timestamp,
		},
		symbol: data.symbol,
	};
});

interface SocketMsgFill {
	ext_order_id: string;
	is_maker: boolean;
	is_selftrade: boolean;
	leverage: number;
	margin_type: string;
	order_id: number;
	partial: boolean;
	price: number;
	quantity: number;
	side: string;
	symbol: string;
	user_id: number;
}

export type Fill = KeysToCamelCase<SocketMsgFill>;

refiner.set(TRADING_TYPES.FILL, v => {
	LOG3(v.data, 'FILL');
	const data = v.data as SocketMsgFill;
	const refinedData = v.data;
	return {
		...v,
		data: refinedData,
	};
});

refiner.set(TRADING_TYPES.ORDER_REJECTION, v => {
	LOG3(v?.data, 'Order fail');
	displayToast(
		<p className="text-sm">
			Order Failed
			<br />
			{toNormalCase(v?.data?.reason)}
		</p>,
		{
			type: 'warning',
			level: TOAST_LEVEL.CRITICAL,
			toastId: 'req-login-place-order',
		}
	);
	// TODO : do something to the UI
	return v;
});

refiner.set(TRADING_TYPES.LIQUIDITY_BUILDING, v => {
	LOG3(v, 'Liquidity building');
	// TODO : do something to the UI
	return v;
});

refiner.set(TRADING_TYPES.LIQUIDATIONS, v => {
	// LOG3(v, 'Liquidations');
	return { ...v, data: camelCaseAllKeys(v?.data) };
});

refiner.set(TRADING_TYPES.DONE, v => {
	LOG3(v, 'Done');
	return v;
});

export interface ReceivedOrder {
	extOrderId: string;
	leverage: number;
	orderId: number;
	price: number;
	quantity: number;
	symbol: string;
	timestamp: number;
	uid: number;
}
refiner.set(TRADING_TYPES.RECEIVED, v => {
	if (!v.data) return v;
	LOG3(v, 'RECEIVED');
	const obj = v.data;
	return {
		...v,
		data: {
			orderId: obj?.order_id,
			extOrderId: obj?.ext_order_id,
			price: obj?.price,
			quantity: obj?.quantity,
			leverage: obj?.leverage,
			symbol: obj?.symbol,
			timestamp: parseTime(obj?.timestamp),
			uid: obj?.uid,
		} as ReceivedOrder,
		type: TRADING_TYPES.RECEIVED,
	};
});

export interface OrderInvoice {
	invoice: string;
	margin: string;
	orderId: number;
	symbol: string;
}
refiner.set(TRADING_TYPES.ORDER_INVOICE, v => {
	LOG3(v, 'order invoice');
	const refinedData = {
		invoice: v.data?.invoice,
		margin: v.data?.margin,
		orderId: v.data?.order_id,
		symbol: v.data?.symbol,
	} as unknown as OrderInvoice;
	return {
		data: {
			...refinedData,
		},
		symbol: v.data?.symbol,
		type: v?.type,
	};
});

refiner.set(TRADING_TYPES.DEPOSIT_REJECTION, v => {
	LOG3(v, 'Deposit reject');
	return v;
});

refiner.set(TRADING_TYPES.SETTLEMENT_REQUEST, v => {
	return {
		...v,
		data: camelCaseAllKeys(v.data),
	};
});

refiner.set(TRADING_TYPES.WITHDRAWAL_SUCCESS, v => {
	LOG3(v, 'Withdrawal success');
	return v;
});

refiner.set(TRADING_TYPES.WITHDRAWAL_REJECTION, v => {
	LOG3(v, 'Withdrawl reject');
	return v;
});

// CHANNELS
export interface RAW_BALANCES extends SocketMsgWrapper {
	data: {
		cash: string;
		cross_margin: string;
		isolated_margin: {
			[symbol: string]: string;
		};
		order_margin: {
			[symbol: string]: string;
		};
	};
}

export interface Balances {
	cash: string;
	crossMargin: string;
	isolatedMargin: {
		[symbol: string]: string;
	};
	orderMargin: {
		[symbol: string]: string;
	};
}

refiner.set(CHANNELS.BALANCES, (balances: RAW_BALANCES) => {
	LOG3(balances.data, 'balances');
	return {
		...balances,
		data: {
			cash: balances.data.cash,
			isolatedMargin: balances.data.isolated_margin,
			orderMargin: balances.data.order_margin,
			crossMargin: balances.data.cross_margin,
		} as Balances,
	};
});

export interface PositionState {
	backruptcyPrice: string;
	entryPrice: string;
	entryValue: string;
	adlScore: string;
	funding: string;
	isLiquidating: boolean;
	leverage: string;
	liqPrice: string;
	openOrderIds: number[];
	quantity: string;
	realLeverage: string;
	rpnl: string;
	side: string;
	symbol: string;
	timestamp: number;
	upnl: string;
}

//  channels
refiner.set(CHANNELS.POSITION_STATES, v => {
	// console.log('POSITION_STATES', v);
	const ret = {
		...v,
		data: {
			backruptcyPrice: v.data?.bankruptcy_price, // fuck you backrupty_price for my time
			entryPrice: v.data?.entry_price,
			entryValue: v.data?.entry_value,
			adlScore: v.data?.adl_score,
			funding: v.data?.funding,
			isLiquidating: v.data?.is_liquidating,
			leverage: v.data?.leverage,
			liqPrice: v.data?.liq_price,
			openOrderIds: v.data?.open_order_ids,
			quantity: v.data?.quantity,
			realLeverage: v.data?.real_leverage,
			rpnl: v.data?.rpnl,
			side: v.data?.side,
			symbol: v.data?.symbol,
			timestamp: parseTime(v.data?.timestamp),
			upnl: v.data?.upnl,
		} as PositionState,
	};
	return ret;
});

export interface IndexValues {
	denom: string;
	symbol: string;
	value: number;
}

refiner.set(CHANNELS.INDEX_VALUES, v => {
	// if (v.data?.symbol?.includes('BTC')) console.log('indexUpdate', v.data.value);
	return {
		data: {
			denom: v.data?.denom,
			symbol: String(v.data?.symbol).substr(1, v.data?.symbol?.length),
			value: v.data?.value,
		} as IndexValues,
		seq: v?.seq,
		type: v?.type,
	};
});

refiner.set(CHANNELS.FUNDING_RATES, v => {
	return {
		...v,
	};
});

interface RawMarkPrice extends SocketMsgWrapper {
	data: {
		price: string;
		symbol: string;
	};
}
refiner.set(CHANNELS.MARK_PRICE, (msg: RawMarkPrice) => {
	return {
		...msg,
		data: {
			symbol: msg.data.symbol,
			price: msg.data.price,
		},
	};
});

refiner.set(CHANNELS.ORDERBOOK_LEVEL2, v => {
	return {
		...v,
		data: {
			price: v.data?.price,
			side: v.data?.side,
			volume: v.data?.volume,
			symbol: v.data?.symbol,
		},
	};
});

interface Level2State extends SocketMsgWrapper {
	data: {
		asks: {
			[ask: number]: number;
		};
		bids: {
			[bid: number]: number;
		};
		seq_number: number;
		symbol: string;
		update_type: string;
	};
}
refiner.set(CHANNEL_OPTIONS.ORDERBOOK_LEVEL2.customType, (res: Level2State) => {
	if (res.data.update_type === 'delta') {
		// console.log('ORDERBOOK_LEVEL2 delta - ' + res.data?.seq_number);
		const ret = {
			...res,
			data: {
				asks: sortObjByKeys(res.data?.asks, [{ desc: v => Number(v) }]),
				bids: sortObjByKeys(res.data?.bids, [{ desc: v => Number(v) }]),
				updateType: 'delta',
				seqNumber: res.data?.seq_number,
			},
		};
		return ret;
	}
	// LOG3(res, 'ORDERBOOK_LEVEL2 snapshot - ' + res.data?.seq_number);
	const mid = Number(
		divide(
			add(
				Math.min(...map(keys(res.data?.asks), v => Number(v))),
				Math.max(...map(keys(res.data?.bids), v => Number(v)))
			),
			2,
			5
		)
	);
	const ret = {
		...res,
		data: {
			asks: sortObjByKeys(res.data?.asks, [{ desc: v => Number(v) }]),
			mid,
			bids: sortObjByKeys(res.data?.bids, [{ desc: v => Number(v) }]),
			asksTotal: 0,
			bidsTotal: 0,
			updateType: 'snapshot',
			symbol: res.data.symbol,
			seqNumber: res.data?.seq_number,
		},
	};
	const askAccumArr = createAccumulatedArray(
		map(ret.data.asks, arr => arr[1]),
		true
	);
	each(ret.data.asks, (v, i) => v.push(askAccumArr[i]));
	const bidAccumArr = createAccumulatedArray(
		map(ret.data.bids, arr => arr[1]),
		false
	);
	each(ret.data.bids, (v, i) => v.push(bidAccumArr[i]));
	ret.data.asksTotal = !empty(askAccumArr) ? askAccumArr[0] : 0;
	ret.data.bidsTotal = !empty(bidAccumArr) ? bidAccumArr[bidAccumArr.length - 1] : 0;
	// console.log(ret);
	return ret;
});

refiner.set(TRADING_TYPES.DEPOSIT_SUCCESS, v => {
	LOG3(v, 'DEPOSIT_SUCCESS');
	return v;
});

refiner.set(TRADING_TYPES.RAW_DEPOSIT, v => {
	LOG3(v, 'RAW_DEPOSIT');
	return v;
});

refiner.set(WS.MESSAGES.POSITIONS.refineType, v => {
	LOG3(v, 'positions');
	const obj = {};
	each(keys(v.data?.positions), symbol => (obj[symbol] = camelCaseAllKeys(v.data.positions[symbol])));
	return { ...v, data: obj };
});

refiner.set(TRADING_TYPES.LNURL_WITHDRAWAL_REQUEST, v => {
	LOG3(v, 'LNURL_WITHDRAWAL_REQUEST');
	return { ...v, data: camelCaseAllKeys(v.data) };
});

refiner.set(TRADING_TYPES.RAW_WITHDRAWAL, v => {
	LOG3(v, 'RAW_WITHDRAWAL');
	return { ...v, data: camelCaseAllKeys(v.data) };
});

refiner.set(TRADING_TYPES.ADL_NOTICE, v => {
	LOG3(v, 'ADL_NOTICE');
	// type, symbol, price, quantity
	return { ...v, data: camelCaseAllKeys(v.data) };
});

export interface WithdrawalLimitInfo {
	dailyWithdrawalLimits: {
		bitcoin: number;
		lightning: number;
		solana: number;
	};
	dailyWithdrawalVolumes: {
		lightning: number;
	};
}
refiner.set(TRADING_TYPES.WITHDRAWAL_LIMIT_INFO, v => {
	LOG3(v, 'WITHDRAWAL_LIMIT_INFO');
	return { ...v, data: camelCaseAllKeys(v.data) as WithdrawalLimitInfo };
});

refiner.set('error', v => {
	LOG5(v, 'ws error');
	if (v.data === 'User was banned from trading.') {
		// TODO :	do something to the UI
	}
	return v;
});

// unused
const refineOrder = obj => ({
	extOrderId: obj?.ext_order_id,
	filled: obj?.filled,
	leverage: obj?.leverage,
	marginType: obj?.margin_type,
	orderId: obj?.order_id,
	orderType: obj?.order_type,
	price: obj?.price,
	quantity: obj?.quantity,
	settlementType: obj?.settlement_type,
	side: obj?.side,
	symbol: obj?.symbol,
	timestamp: parseTime(obj?.timestamp),
});

interface IOpenOrder {
	ext_order_id: string;
	filled: number;
	leverage: number;
	margin_type: string;
	order_id: number;
	order_type: string;
	price: number;
	quantity: number;
	settlement_type: string;
	side: string;
	symbol: string;
	timestamp: number;
}

export interface OpenOrders {
	[symbol: string]: OpenOrder[];
}
export type OpenOrder = ReturnType<typeof refineOrder>;
refiner.set(
	UNUSED_TRADING_TYPES.OPEN_ORDERS,
	(data: { data: { open_orders: { [symbol: string]: IOpenOrder[] } }; seq: number; type: string }) => {
		LOG3(data, 'OPEN_ORDERS');
		const retObj = {};
		const pickedData = data.data?.open_orders;
		mapKeyValues(pickedData, (symbol, orderArr) => {
			const obj = {};
			each(orderArr, order => {
				obj[order.order_id] = refineOrder(order);
			});
			retObj[symbol] = obj;
		});
		return {
			type: data?.type,
			data: retObj,
		};
	}
);

export interface RawAdvancedOrders {
	advanced_order_type: string;
	ext_order_id: string;
	filled: number;
	leverage: number;
	margin_type: string;
	order_id: number;
	order_type: string;
	price: number;
	quantity: number;
	settlement_type: string;
	side: string;
	symbol: string;
	timestamp: number;
	trigger_price_type: string;
	uid: number;
}
export type AdvancedOrder = KeysToCamelCase<RawAdvancedOrders>;
// or TRADING_TYPES.USER_ADVANCED_ORDERS
refiner.set(WS.MESSAGES.ADVANCED_ORDERS.refineType, v => {
	LOG3(v, 'ADVANCED_ORDERS');
	const data = camelCaseAllKeys(v.data);
	return { ...v, data: data };
});

//  messages
refiner.set(WS.MESSAGES[MESSAGE_TYPES.SUBSCRIBE].type, v => {
	return v;
});

refiner.set(WS.MESSAGES[MESSAGE_TYPES.UNSUBSCRIBE].type, v => {
	return v;
});

refiner.set(WS.MESSAGES[MESSAGE_TYPES.AUTHENTICATE].type, v => {
	return v;
});

export const wsDataRefiner = (name, data) => {
	let refinerFunc = null;
	if (refiner.has(name)) {
		refinerFunc = refiner.get(name);
	}
	if (!isFunction(refinerFunc)) {
		refinerFunc = refiner.get(`fetch_${name}`);
		if (!isFunction(refinerFunc)) {
			console.log('no refiner ws', data);
			throw new Error(`CRITICAL - refiner function for ${name} is non-existent`);
		}
	}
	let ret;
	try {
		ret = refinerFunc(data);
		// LOG(retw, `ws<${name}>`);
		// TOOD : add back to code when socket data is retrieved in a more structured fashion
		// validateDataFilled(ret, name); //  throws when missing value
	} catch (ex) {
		ret = new CustomError('refiner Error', ex);
	}
	return ret;
};
