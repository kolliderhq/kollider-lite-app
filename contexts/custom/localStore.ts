import each from 'lodash-es/each';
import keys from 'lodash-es/keys';
// eslint-disable-next-line prettier/prettier
import store, { StoreAPI } from 'store2'; //	srsly wtf

import cookie from 'js-cookie';

import { GENERAL } from '../../constants/misc/general';

class LocalStore {
	private _currentStore: StoreAPI;
	constructor(namespace = GENERAL.LOCAL_STORAGE_NAMESPACES.DEFAULT) {
		this.get = this.get.bind(this);
		this._currentStore = store.namespace(namespace);
		const all = this._currentStore.getAll();
		each(keys(all), key => {
			this.migrateJwtsFromLocalStoreToCookies(key);
		});
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

	/**
	 * @desc migrates sensitive information to cookies instead of local storage
	 * @param key
	 */
	migrateJwtsFromLocalStoreToCookies(key: string) {
		if (key.includes('USER') && this._currentStore.has(key)) {
			this.cookieSet(key, this._currentStore.get(key));
			this._currentStore.remove(key);
		}
	}
}

const defaultLocalStore = new LocalStore();

export { LocalStore, defaultLocalStore };