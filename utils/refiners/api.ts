import { API, API_NAMES } from 'constants/api';

import { sort } from 'fast-sort';
import each from 'lodash-es/each';
import isArray from 'lodash-es/isArray';
import isFunction from 'lodash-es/isFunction';
import isNil from 'lodash-es/isNil';
import isObject from 'lodash-es/isObject';

import { LOG, LOG2, LOG4 } from '../debug';
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
	const dataArr = mapKeyValues(data, (k, v) => v);
	sort(dataArr).asc(v => v.symbol);
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
