import React from 'react';

import { CONTEXTS } from 'constants/contexts';
import { SETTINGS } from 'constants/misc/settings';
import { USER_TYPES } from 'constants/user';

import { defaultLocalStore } from 'contexts/custom/localStore';
import { setApiKey } from 'contexts/modules/connection';
import { setInitNotifications } from 'contexts/modules/notifications';
import { setUserLogout } from 'contexts/modules/user';
import { storeDispatch } from 'contexts/store';
import { initTradingObj, updateTradingStore } from 'contexts/tradingStore';
import { useAppDispatch, useAppSelector } from 'hooks/redux';

// import { displayToast } from 'utils/toast';

let logoutTimeout;
export default function useAutoLogout() {
	const dispatch = useAppDispatch();
	const [focus, setFocus] = React.useState(true);
	const userData = useAppSelector(state => state.user.data);
	React.useEffect(() => {
		if (typeof window === undefined) return;
		window.addEventListener('focus', () => setFocus(true));
		window.addEventListener('blur', () => setFocus(false));
		window.addEventListener('beforeunload', () => {
			if (!defaultLocalStore.get(CONTEXTS.LOCAL_STORAGE.FULL_USER)) return;
		});
	}, []);

	React.useEffect(() => {
		if (userData.email === '' || userData.type === USER_TYPES.LIGHT) {
			clearTimeout(logoutTimeout);
			return;
		}
		if (focus) {
			clearTimeout(logoutTimeout);
		} else {
			logoutTimeout = setTimeout(() => {
				logOutFunc();
			}, SETTINGS.LIMITS.TOKEN_PERSIST);
		}
	}, [focus, userData, dispatch]);
}

export const logOutFunc = () => {
	storeDispatch(setInitNotifications());
	defaultLocalStore.cookieUnset(CONTEXTS.LOCAL_STORAGE.FULL_USER);
	defaultLocalStore.cookieUnset(CONTEXTS.LOCAL_STORAGE.FULL_USER_REFRESH);
	storeDispatch(setUserLogout());
	storeDispatch(setApiKey(''));
	const obj = { ...initTradingObj };
	// delete obj.lastMatches;
	updateTradingStore(obj);
};
