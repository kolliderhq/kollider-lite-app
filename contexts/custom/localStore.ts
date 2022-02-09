import cookie from 'js-cookie';
import each from 'lodash-es/each';
import isObject from 'lodash-es/isObject';
import keys from 'lodash-es/keys';
import store, { StoreAPI } from 'store2';

import { CONTEXTS } from 'consts';
import { GENERAL } from 'consts/misc/general';

class LocalStore {
	private _currentStore: StoreAPI;
	constructor(namespace = GENERAL.LOCAL_STORAGE_NAMESPACES.DEFAULT) {
		this.get = this.get.bind(this);
		this._currentStore = store.namespace(namespace);
	}

	/**
	 * @desc Clears all data from local store
	 */
	clearAll() {
		const allKeys = keys(CONTEXTS.LOCAL_STORAGE);
		each(allKeys, key => {
			if (key.includes('USER')) {
				this.cookieUnset(key);
			} else {
				this._currentStore.remove(key);
			}
		});
		this.unset('settings');
	}

	/**
	 * @desc returns the item
	 * @param {string} input
	 * @returns {array|object|*}
	 */
	get(input: string) {
		if (input.includes('USER')) return this.cookieGet(input);
		return this._currentStore.get(input);
	}

	/**
	 * gets value from cookie
	 * @param input
	 * @returns {*}
	 */
	cookieGet(input: string) {
		const res = cookie.get(input);
		try {
			return JSON.parse(res);
		} catch {
			return res;
		}
	}

	/**
	 * @desc sets value. No recursion because user may wish to store arrays / objects
	 * @param key{string}
	 * @param value{object<any>}
	 * @returns {any}
	 */
	set(key: string, value: any) {
		if (key.includes('USER')) {
			this.cookieSet(key, value);
		}
		return this._currentStore.set(key, value);
	}

	/**
	 * @desc sets value. No recursion because user may wish to store arrays / objects
	 * @param key{string}
	 * @param value{object<any>}
	 * @returns {any}
	 */
	// TODO : apply cookie expire according to jwt's expire time
	cookieSet(key: string, value: any) {
		if (isObject(value)) {
			return cookie.set(key, JSON.stringify(value), { sameSite: 'strict', domain: window.location.hostname });
		}
		return cookie.set(key, value, { sameSite: 'strict', domain: window.location.hostname });
	}

	cookieUnset(key: string) {
		cookie.remove(key, { sameSite: 'strict', domain: window.location.hostname });
		cookie.remove(key);
	}

	has(key: string) {
		if (key.includes('USER')) return cookie.get(key) !== undefined;
		return this._currentStore.has(key);
	}

	unset(key: string) {
		if (key.includes('USER')) {
			this.cookieUnset(key);
			return;
		}
		this._currentStore.remove(key);
	}
}

const defaultLocalStore = new LocalStore();

export { LocalStore, defaultLocalStore };
