import { sort } from 'fast-sort';
import each from 'lodash-es/each';
import filter from 'lodash-es/filter';
import identity from 'lodash-es/identity';
import includes from 'lodash-es/includes';
import isArray from 'lodash-es/isArray';
import isFunction from 'lodash-es/isFunction';
import isNil from 'lodash-es/isNil';
import isObject from 'lodash-es/isObject';
import keys from 'lodash-es/keys';
import map from 'lodash-es/map';
import pickBy from 'lodash-es/pickBy';

import { API, API_NAMES } from 'consts/api';
import { reduxStore } from 'contexts';
import { divide } from 'utils/Big';
import { LOG, LOG2, LOG4 } from 'utils/debug';

import { CustomError } from '../error';
import { camelCaseAllKeys } from '../format';
import { deepFreeze, mapKeyValues } from '../scripts';
import { parseTime } from '../time';
import { KeysToCamelCase, Nullable } from '../types/utils';

const refiner = new Map();

interface IStatus {
	msg: string;
	next_maintenance: Nullable<number>;
	status: string;
}
refiner.set(API_NAMES.STATUS, (data: IStatus) => {
	const ret = camelCaseAllKeys(data);
	if (ret?.nextMaintenance) ret.nextMaintenance = parseTime(ret.nextMaintenance);
	return ret;
});

refiner.set(API_NAMES.REGISTER, data => {
	return { success: true };
});

interface ILogin {
	token: string;
	refresh: string;
}
refiner.set(API_NAMES.LOGIN, (data: ILogin) => {
	return {
		token: data.token,
		refresh: data.refresh,
	};
});

refiner.set(API_NAMES.WHOAMI, data => {
	return {
		userId: data?.id,
		token: data?.token,
		username: data?.username,
	};
});

interface IPRODUCT {
	symbol: string;
	contract_size: string;
	max_leverage: string;
	base_margin: string;
	maintenance_margin: string;
	is_inverse_priced: boolean;
	price_dp: number;
	underlying_symbol: string;
	last_price: string;
	tick_size: string;
	risk_limit: string;
}

interface IPRODUCTS {
	[symbol: string]: IPRODUCT;
}
export interface PRODUCTS {
	[symbol: string]: KeysToCamelCase<IPRODUCT>;
}
refiner.set(API_NAMES.PRODUCTS, (data: IPRODUCTS) => {
	// console.log('products >>>>>', data);
	const arr = mapKeyValues(data, (k, v) => v);
	const dataArr = sort(arr).asc(v => v.symbol);
	const products = {};
	// console.log('products data Array >>>>>', dataArr);
	each(dataArr, v => {
		products[v.symbol] = {
			symbol: v.symbol,
			contractSize: Number(v.contract_size),
			maxLeverage: Number(v.max_leverage),
			baseMargin: Number(v.base_margin),
			maintenanceMargin: Number(v.maintenance_margin),
			isInversePriced: v.is_inverse_priced,
			priceDp: Number(v.price_dp),
			underlyingSymbol: v.underlying_symbol,
			lastPrice: Number(v.last_price),
			tickSize: Number(v.tick_size),
			name: v.name ? v.name : '',
		};
	});
	LOG2(products, 'PRODUCTS');
	return products;
});

refiner.set(API_NAMES.WALLET_DEPOSIT, data => {
	LOG2(data, 'WALLET_DEPOSIT');
	return camelCaseAllKeys(data);
});

refiner.set(API_NAMES.REFRESH_JWT, data => {
	return {
		token: data?.token,
	};
});

interface IHistoricalOhlc {
	data: IOHLC[];
	symbol: string;
}
refiner.set(API_NAMES.HISTORICAL_OHLC, (data: IHistoricalOhlc) => {
	const store = reduxStore.getState();
	const symbol = data?.symbol;
	let priceDp = store.symbols.symbolData[symbol]?.priceDp;
	if (!priceDp) priceDp = 1;

	const ret = map(data.data, dataPoint => {
		const value = pickBy(dataPoint, identity);
		each(keys(value), key => {
			if (key === 'time') {
				value.time = parseTime(value.time) / 1000;
			} else value[key] = value[key] ? Number(divide(value[key], Math.pow(10, 1), priceDp)) : null;
			// TODO : tell Kons to fix the Api ^ - it should be returning natural numbers like the historical_ohlc_chart api
		});
		return value;
	});
	return { ...data, data: ret };
});

export interface IOHLC {
	high: Nullable<number>;
	close: Nullable<number>;
	low: Nullable<number>;
	open: Nullable<number>;
	time: Nullable<number>;
	volume: Nullable<number>;
}

const BOT_UIDS = ['1', '7', '12', '13', '14', '406', '1163'];

type TTradeLeaderboard = {
	mean_leverage: number;
	number_of_trades: number;
	total_rpnl: number;
	total_volume: number;
	uid: string;
}[];

refiner.set(API_NAMES.TRADE_LEADERBOARD, (data: TTradeLeaderboard) => {
	LOG(data, 'TRADE_LEADERBOARD');
	return filter(
		map(data, v => camelCaseAllKeys(v)),
		v => !includes(BOT_UIDS, v.uid)
	);
});

interface IUserAccount {
	created_at: {
		nanos_since_epoch: number;
		secs_since_epoch: number;
	};
	email: string;
	lnauth_enabled: boolean;
	user_type: string;
	username: string;
	validated_email: boolean;
}
refiner.set(API_NAMES.USER_ACCOUNT, (data: IUserAccount) => {
	LOG(data, 'USER_ACCOUNT');
	return { ...camelCaseAllKeys(data) };
});

refiner.set(API_NAMES.HISTORICAL_INDEX_PRICES, data => {
	LOG2(data, 'HISTORICAL_INDEX_PRICES');
	return { ...data, data: data.data.map(v => [parseTime(v.time), v.mean]) };
});

refiner.set(API_NAMES.HISTORICAL_MARK_PRICES, data => {
	LOG2(data, 'HISTORICAL_MARK_PRICES');
	return { ...data, data: data.data.map(v => [parseTime(v.time), v.price]) };
});

// interface IHistoricAssetValue {
// 	mean_maket_value: number;
// 	mean_notional_value: number;
// 	time: number;
// }
// interface IHistoricAssetValues {
// 	data: IHistoricAssetValue[];
// 	symbol: string;
// }
// refiner.set(API_NAMES.HISTORIC_ASSET_VALUES, (data: IHistoricAssetValues) => {
// 	LOG(data, 'HISTORIC_ASSET_VALUES');
// 	const symbol = data?.symbol.includes('.') ? data.symbol : `${data?.symbol}.PERP`;
// 	return { data: map(data.data, v => camelCaseAllKeys(v)), symbol: symbol };
// });

interface ITradeSummary {
	mean_leverage: number;
	number_of_trades: number;
	time: number;
	total_rpnl: number;
}
refiner.set(API_NAMES.TRADE_SUMMARY, (data: ITradeSummary) => {
	return { ...camelCaseAllKeys(data) };
});

refiner.set(API_NAMES.AUTH_LNURL, data => {
	LOG(data, 'AUTH_LNURL');
	return camelCaseAllKeys(data);
});

export const apiRefiner = (name, data) => {
	let refinerFunc = null;
	if (refiner.has(name)) {
		refinerFunc = refiner.get(name);
	}
	if (!isFunction(refinerFunc)) {
		console.log('no refiner api', data);
		throw new CustomError(`CRITICAL - refiner function for ${name} is non-existent`);
	}
	let ret = data;
	try {
		ret = refinerFunc(data);
		// LOG2(ret, `refiner - ${name}`);
		validateDataFilled(ret, name); //  throws when missing value
	} catch (ex) {
		ret = new CustomError('refiner Error', ex);
	}
	return ret;
};

// throws if any value is nil
// export const validateDataFilled = (data: unknown, key: string) => {
export const validateDataFilled = (data, key) => {
	if (API.API[key]?.allowNull && !isNil(data)) return; //  no checks
	if (isArray(data)) {
		each(data, value => {
			validateDataFilled(value, key);
		});
	} else if (isObject(data)) {
		mapKeyValues(data as Record<any, any>, (key, value) => {
			validateDataFilled(value, key);
		});
	} else {
		if (isNil(data)) {
			LOG4(`key not defined [${key}]`, `apiRefiner`);
			throw new Error(`key not defined [${key}]`);
		}
	}
};
