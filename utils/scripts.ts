import each from 'lodash-es/each';
import isArray from 'lodash-es/isArray';
import keys from 'lodash-es/keys';
import map from 'lodash-es/map';

import { divide, multiply } from 'utils/Big';

import { FixedLengthArray } from './types/utils';

export function categorizeBySymbol<T>(
	root: Record<string, T> | T[],
	symbolGetter: (element: T) => string,
	options?: {
		idGetter?: (element: T) => string | number; // necessary when root is object
	}
) {
	const ret = {};
	if (isArray(root)) {
		if (!options?.idGetter) throw new Error('categorizeBySymbol needs idGetter option to process arrays');

		const target = root as T[];
		each(target, element => {
			try {
				const symbol = symbolGetter(element);
				const id = options?.idGetter(element);
				if (!ret[symbol]) ret[symbol] = {};
				ret[symbol][id] = element;
			} catch (ex) {
				console.log('[categorizeBySymbol] error while getting symbol or id');
				console.error(ex);
			}
		});
	} else {
		const target = root as Record<string, T>;
		each(target, (element, key) => {
			try {
				const symbol = symbolGetter(element);
				let id = key;
				if (options?.idGetter) {
					id = `${options.idGetter(element)}`;
				}
				if (!ret[symbol]) ret[symbol] = {};
				ret[symbol][id] = element;
			} catch (ex) {
				console.log('[categorizeBySymbol] error while getting symbol or id');
				console.error(ex);
			}
		});
	}
	return ret as Record<string, Record<string, T>>;
}

export const dispSymbol = (txt: string): string => {
	return `${txt.substr(0, txt.length - 3)}•${txt.substr(txt.length - 3)}`;
};

export const waitms = (ms: number) => {
	return new Promise<void>(resolve => {
		setTimeout(() => {
			resolve();
		}, ms);
	});
};

export const isNumber = (input: unknown) => !isNaN(Number(input));

export const timestampByInterval = (timestamp: number, interval: number): number => {
	return Number(multiply(Math.ceil(Number(divide(timestamp, interval, 1))), interval, 0));
};

export const mapKeyValues = <T>(obj: Record<any, T>, cb = (k: string, v: T) => undefined) =>
	map(keys(obj), (key: string) => cb(key, obj[key]));

export const isPositiveInteger = (input: unknown) =>
	isNumber(input) && Number(input) >= 0 && !String(input).includes('.');

export const deepFreeze = (obj: any) => {
	Object.keys(obj).forEach(prop => {
		if (typeof obj[prop] === 'object' && !Object.isFrozen(obj[prop])) {
			deepFreeze(obj[prop]);
		}
	});
	return Object.freeze(obj);
};

export const listenToWindowVisibilityChange = (listener: (isVisible: boolean) => void): (() => void) => {
	let hidden, visibilityChange;
	if (typeof document.hidden !== 'undefined') {
		// Opera 12.10 and Firefox 18 and later support
		hidden = 'hidden';
		visibilityChange = 'visibilitychange';
	}
	// @ts-ignore
	else if (typeof document.msHidden !== 'undefined') {
		hidden = 'msHidden';
		visibilityChange = 'msvisibilitychange';
	}
	// @ts-ignore
	else if (typeof document.webkitHidden !== 'undefined') {
		hidden = 'webkitHidden';
		visibilityChange = 'webkitvisibilitychange';
	}
	function handleVisibilityChange() {
		listener(!document[hidden]);
	}
	document.addEventListener(visibilityChange, handleVisibilityChange, false);
	return () => document.removeEventListener(visibilityChange, handleVisibilityChange, false);
};

export const getHiddenVisChange = (): FixedLengthArray<[string, string]> => {
	let hidden, visibilityChange;
	if (typeof document.hidden !== 'undefined') {
		// Opera 12.10 and Firefox 18 and later support
		hidden = 'hidden';
		visibilityChange = 'visibilitychange';
	} else if (typeof (document as any).msHidden !== 'undefined') {
		hidden = 'msHidden';
		visibilityChange = 'msvisibilitychange';
	} else if (typeof (document as any).webkitHidden !== 'undefined') {
		hidden = 'webkitHidden';
		visibilityChange = 'webkitvisibilitychange';
	}
	return [hidden, visibilityChange];
};

export const getIsDocumentHidden = (): boolean => {
	let [hidden] = getHiddenVisChange();
	return document[hidden];
};

export const applyOptionalParams = (obj: Record<any, any>, onlyParams: boolean = true) => {
	let ret = onlyParams ? '' : '&';
	mapKeyValues(obj, (key, value) => {
		if (value) {
			ret = `${ret}${key}=${value}&`;
		}
	});
	return ret.slice(0, -1);
};
