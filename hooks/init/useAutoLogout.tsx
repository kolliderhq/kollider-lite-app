import React from 'react';

import { CONTEXTS, SETTINGS, USER_TYPE } from 'consts';
import {
	defaultLocalStore,
	setApiKey,
	setInitNotifications,
	setInitTrading,
	setUserLogout,
	storeDispatch,
} from 'contexts';
import { useAppDispatch, useAppSelector } from 'hooks';

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
		if (userData.email === '' || userData.type === USER_TYPE.LIGHT) {
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
	storeDispatch(setInitTrading());
};
