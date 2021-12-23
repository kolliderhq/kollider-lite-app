import moment, { Dayjs } from 'dayjs';
import duration from 'dayjs/plugin/duration';
import empty from 'is-empty';
import camelCase from 'lodash-es/camelCase';
import capitalize from 'lodash-es/capitalize';
import isArray from 'lodash-es/isArray';
import isObject from 'lodash-es/isObject';
import isString from 'lodash-es/isString';
import keys from 'lodash-es/keys';
import lowerCase from 'lodash-es/lowerCase';
import map from 'lodash-es/map';
import reduce from 'lodash-es/reduce';
import toString from 'lodash-es/toString';

import { TBigInput, divide, fixed, multiply } from 'utils/Big';

import { parseTime } from './time';

moment.extend(duration);

export const applyDp = (value: TBigInput, dp: number): TBigInput => {
	return divide(value, Math.pow(10, dp), dp);
};

export const getNumberColour = (value: TBigInput): string => {
	if (Number(value) > 0.001) return 'text-green-400';
	else if (Number(value) < -0.001) return 'text-red-400';
	else return 'text-gray-100';
};

export const setAmountStyle = (
	amount: TBigInput,
	sizeInt: number,
	sizeDecimal: number,
	denom?: string,
	sizeDenom?: number,
	denomClass?: string
): { __html: string } => {
	const amountArr = formatNumber(amount).split('.');
	return {
		__html: `<span class='text-center' style="font-size:${sizeInt}px;">${amountArr[0]}${
			amountArr[1] ? '.' : ''
		}</span>${
			amountArr[1] ? `<span class='text-center' style="font-size:${sizeDecimal}px;">${amountArr[1]}</span>` : ''
		}${
			denom
				? `<span class='ml-1 text-center ${
						denomClass ? denomClass : ''
				  }' style="font-size:${sizeDenom}px;">${denom}</span>`
				: ''
		}`,
	};
};

export const truncateMiddle = (str: string, left: number, right: number): string => {
	if (!isString(str)) return 'Not a string';
	if (str.length <= left + right) return str;
	return str.substr(0, left) + '...' + str.substr(str.length - right, str.length);
};

export const get24hr = (ms: number): string => {
	return moment.duration(ms, 'ms').format('HH:mm:ss');
};

export const get12hrTime = (unix: number | Dayjs): string => {
	return moment(unix).format('hh:mm:ss A');
};

export const get24hrTime = (unix: number | Dayjs): string => {
	return moment(unix).format('HH:mm:ss');
};

export const getTradeDate = (unix: number | Dayjs): string => {
	return moment(unix).format('MM/DD HH:mm:ss');
};

export const getTime = (unix: number | Dayjs): string => moment(unix).format('YYYY-MM-DD HH:mm');

export const getMonthDay = (unix: number | Dayjs): string => moment(unix).format('DD MMM');

export const toNormalCase = (str: string): string => capitalize(lowerCase(str));

export const formatNumber = (v: TBigInput = 0, size: number = 3): string => {
	let str = toString(v);
	if (empty(str)) return 'NaN';
	return formatNum(str);
};

export const formatUSD = (v: string): string => {
	return `$${formatNumber(v)}`;
};

const formatNum = (str: string): string => {
	const n = str,
		p = n.indexOf('.');
	return n.replace(/\d(?=(?:\d{3})+(?:\.|$))/g, (m, i) => (p < 0 || i < p ? `${m},` : m));
};

export const dispUSD = (str: TBigInput, dp: number = 2) => {
	return `$${formatNumber(fixed(str, dp))}`;
};

export const dispPercentage = (str: TBigInput, places = 3) => {
	return `${multiply(str, 100, places)}%`;
};

export const optionalDecimal = (v: string): string => {
	if (Number(v.split('.')?.[1]) === 0) return fixed(v, 0);
	return v;
};

export function camelCaseAllKeys(obj: any): any {
	if (!isObject(obj)) return obj;
	return reduce(
		keys(obj),
		(ret, key) => {
			//	case : symbol
			if (key.includes('.')) {
				ret[key] = camelCaseAllKeys(obj[key]);
			} else if (isArray(obj[key])) {
				ret[camelCase(key)] = map(obj[key], value => {
					if (isObject(value)) return camelCaseAllKeys(value);
					return value;
				});
			} else if (isObject(obj[key])) {
				ret[camelCase(key)] = camelCaseAllKeys(obj[key]);
			} else {
				ret[camelCase(key)] = obj[key];
			}

			if (key === 'time' || key === 'timestamp') ret[key] = parseTime(obj[key]);
			return ret;
		},
		isArray(obj) ? [] : {}
	);
}
