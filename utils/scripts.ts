import isNumber from 'lodash-es/isNumber';
import keys from 'lodash-es/keys';
import map from 'lodash-es/map';

import { divide, multiply } from 'utils/Big';

import { FixedLengthArray } from './types/utils';

export const dispSymbol = (txt: string): string => {
	return `${txt.substr(0, txt.length - 3)}•${txt.substr(txt.length - 3)}`;
};

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
