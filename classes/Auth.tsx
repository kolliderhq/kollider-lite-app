/*
 * state is kept in redux
 * all processes related to authentication will be in this class
 */

import React from 'react';

import capitalize from 'lodash-es/capitalize';
import each from 'lodash-es/each';
import { v4 as uuidv4, v4 } from 'uuid';

import { Processor } from 'classes/Processor';
import { baseSocketClient } from 'classes/SocketClient';
import { API_NAMES, CONTEXTS, DIALOGS, SETTINGS, USER_TYPE } from 'consts';
import {
	defaultLocalStore,
	reduxStore,
	reinitOrder,
	setApiKey,
	setInitNotifications,
	setInitTrading,
	setUserData,
	setUserLogout,
	setUserType,
	storeDispatch,
} from 'contexts';
import { setDialog } from 'contexts/modules/layout';
import { postRequest } from 'utils/api';
import { LOG, LOG3, LOG5 } from 'utils/debug';
import { jwtGetExp } from 'utils/jwt';
import { getMsFromNow } from 'utils/time';
import { TOAST_LEVEL, displayToast } from 'utils/toast';

class Auth {
	public static instance = this;
	public static loginCount = 0;

	private _userType: USER_TYPE;
	private _processor: Processor;
	public constructor() {
		this._userType = USER_TYPE.NULL;
		this._processor = new Processor();
	}

	set userType(newUserType: USER_TYPE) {
		this._userType = newUserType;
	}

	public loadLocalData() {
		if (this._userType !== USER_TYPE.NULL) return false;
		this._processor.requestProcess({
			processFunc: loadLocalDataProcessFunc,
		});
	}

	public persistLogin() {
		if (this._userType !== USER_TYPE.NULL) return false;
		this._processor.requestProcess({
			processFunc: persistLoginProcessFunc,
		});
	}

	public proUserLogin(data: any) {
		this._processor.requestProcess({
			processFunc: () => proUserLoginProcessFunc(data),
		});
	}

	public lightClientLogin() {
		if (this._userType !== USER_TYPE.NULL) return false;
		this._processor.requestProcess({
			processFunc: () => lightClientLoginProcessFunc(),
		});
	}

	public logoutUser() {
		if (this._userType === USER_TYPE.NULL) return false;
		this._processor.requestProcess({
			processFunc: logOutFunc,
		});
	}

	public migrateUser(migrateKey: string) {
		this._processor.requestProcess({
			processFunc: () => migrateUserProcessFunc(migrateKey),
		});
	}
}

const migrateUserProcessFunc = (key: string) => {};

const proUserLoginProcessFunc = data => {
	storeDispatch(setDialog(DIALOGS.NONE));
	storeDispatch(setApiKey(data.accessToken));
	const userData = {
		token: data?.accessToken,
		email: '',
		type: USER_TYPE.PRO,
	};

	displayToast(<p>Login Success</p>, {
		type: 'success',
		level: TOAST_LEVEL.CRITICAL,
	});
	storeDispatch(setUserData(userData));
	defaultLocalStore.cookieSet(CONTEXTS.LOCAL_STORAGE.FULL_USER, { ...userData });
	if (data?.refreshToken) defaultLocalStore.cookieSet(CONTEXTS.LOCAL_STORAGE.FULL_USER_REFRESH, data.refreshToken);
};

const logOutFunc = () => {
	storeDispatch(setInitNotifications());
	defaultLocalStore.cookieUnset(CONTEXTS.LOCAL_STORAGE.FULL_USER);
	defaultLocalStore.cookieUnset(CONTEXTS.LOCAL_STORAGE.FULL_USER_REFRESH);
	storeDispatch(setUserLogout());
	storeDispatch(setApiKey(''));
	storeDispatch(setInitTrading());
	// baseSocketClient.closeSocket(1000, 'logout');
	baseSocketClient.reset();
	// storeDispatch(setIsWsAuthenticated(false));
	displayToast(<p>Successfully Logged Out</p>, {
		type: 'success',
		level: TOAST_LEVEL.IMPORTANT,
	});
};

const loadLocalDataProcessFunc = () => {
	if (defaultLocalStore.has(CONTEXTS.LOCAL_STORAGE.FULL_USER)) {
		if (!defaultLocalStore.has(CONTEXTS.LOCAL_STORAGE.HAS_LOGGED_IN)) {
			defaultLocalStore.set(CONTEXTS.LOCAL_STORAGE.HAS_LOGGED_IN, true);
		}

		//  check token expire and delete localStorage if expired
		const fullUser = defaultLocalStore.get(CONTEXTS.LOCAL_STORAGE.FULL_USER);
		console.log('fullUser', fullUser);
		const exp = jwtGetExp(fullUser?.token);
		// console.log(getMsFromNow(exp * 1000));
		if (getMsFromNow(exp * 1000) * -1 < SETTINGS.LIMITS.JWT_REQUEST_THRESHOLD) {
			LOG('expired, delete', 'token');
			defaultLocalStore.cookieUnset(CONTEXTS.LOCAL_STORAGE.FULL_USER);
			defaultLocalStore.cookieUnset(CONTEXTS.LOCAL_STORAGE.FULL_USER_REFRESH);
		}
	}
};

//	returns true if pro login successful, false if not.
const persistLoginProcessFunc = async () => {
	if (defaultLocalStore.has(CONTEXTS.LOCAL_STORAGE.FULL_USER)) {
		if (!defaultLocalStore.has(CONTEXTS.LOCAL_STORAGE.HAS_LOGGED_IN)) {
			defaultLocalStore.set(CONTEXTS.LOCAL_STORAGE.HAS_LOGGED_IN, true);
		}
		//  check token expire and delete localStorage if expired
		const refreshToken = defaultLocalStore.cookieGet(CONTEXTS.LOCAL_STORAGE.FULL_USER_REFRESH);

		const exp = jwtGetExp(refreshToken);
		if (getMsFromNow(exp * 1000) > SETTINGS.LIMITS.JWT_REQUEST_THRESHOLD * -1) {
			LOG('expired, delete', 'token');
			defaultLocalStore.cookieUnset(CONTEXTS.LOCAL_STORAGE.FULL_USER);
			defaultLocalStore.cookieUnset(CONTEXTS.LOCAL_STORAGE.FULL_USER_REFRESH);
		} else {
			const refresh = defaultLocalStore.cookieGet(CONTEXTS.LOCAL_STORAGE.FULL_USER_REFRESH);
			//  if no refresh, skip over to light login
			if (refresh) {
				//  full user login
				const userObj = defaultLocalStore.cookieGet(CONTEXTS.LOCAL_STORAGE.FULL_USER);

				const exp = jwtGetExp(userObj.token);
				//  can use for less than than 5 minutes - considered expired

				if (getMsFromNow(exp * 1000) > SETTINGS.LIMITS.JWT_REQUEST_THRESHOLD * -1) {
					try {
						const res = await postRequest(API_NAMES.REFRESH_JWT, [], { refresh });
						userObj.token = res.token;
						storeDispatch(setApiKey(userObj.token));
						storeDispatch(setUserData(userObj));
						return true;
					} catch (ex) {
						LOG5('error on refresh jwt - resetting login status', ex);
						defaultLocalStore.cookieUnset(CONTEXTS.LOCAL_STORAGE.FULL_USER);
						defaultLocalStore.cookieUnset(CONTEXTS.LOCAL_STORAGE.FULL_USER_REFRESH);
						return false;
					}
				} else {
					storeDispatch(setApiKey(userObj.token));
					storeDispatch(setUserData(userObj));
					return true;
				}
			}
		}
	}
	return false;
};

const lightClientLoginProcessFunc = async () => {
	console.log('login process');
	if (Auth.loginCount > 0) {
		resetStores();
	}
	Auth.loginCount++;
	//  light client already exists
	if (defaultLocalStore.has(CONTEXTS.LOCAL_STORAGE.ANON_USER)) {
		const userObj = defaultLocalStore.cookieGet(CONTEXTS.LOCAL_STORAGE.ANON_USER);
		console.log('anon user', userObj);
		LOG3(userObj.token, 'retrieve token');
		storeDispatch(setApiKey(userObj.token));
		storeDispatch(setUserData(userObj));
		return;
	}
	try {
		const userObj = await registerAnonUser();
		LOG(userObj, 'register anon res');
		storeDispatch(setApiKey(userObj.token));
		storeDispatch(setUserData(userObj));
	} catch (ex) {
		// displayToast('Server Unavailable', 'error', { position: 'top-right', autoClose: false }, 'Critical Error');
		// TODO
		//  retry logic
		//  display error
	}
};

function resetStores() {
	const store = reduxStore.getState();
	const obj = {};
	const symbols = store.symbols.symbols;
	each(symbols, v => {
		obj[v] = null;
	});
	storeDispatch(reinitOrder());
	storeDispatch(setInitTrading());
	// reinit invoices
}

async function registerAnonUser() {
	const userObj = createAnonymousUser();
	try {
		await postRequest(API_NAMES.REGISTER, [], userObj);
		const res = await postRequest(API_NAMES.LOGIN, [], { email: userObj.email, password: userObj.password });
		LOG(res, 'light login result');
		if (res?.refresh) {
			defaultLocalStore.cookieSet(CONTEXTS.LOCAL_STORAGE.ANON_USER_REFRESH, res.refresh);
		}
		if (!res?.token) throw new Error('token was not returned from login');
		LOG3(res.token, 'new token');
		const retObj = {
			token: res.token,
			email: userObj.email,
			type: USER_TYPE.LIGHT,
		};
		defaultLocalStore.cookieSet(CONTEXTS.LOCAL_STORAGE.ANON_USER, retObj);
		return retObj;
	} catch (ex) {
		LOG5('anon user registration failed', 'Login');
		console.error(ex);
		throw new Error('anon user generation failed');
	}
}

/**
 * @returns {{password: string, email: string, username: string}}
 */
const createAnonymousUser = () => {
	const id = v4();
	return {
		username: 'username-' + id,
		email: id + '@kollider.xyz',
		password: capitalize(`${id.slice(0, 10)}$`),
		user_type: USER_TYPE.LIGHT,
	};
};

export const auth = new Auth();
