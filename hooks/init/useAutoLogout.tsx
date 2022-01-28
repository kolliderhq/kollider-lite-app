import React from 'react';

import { auth } from 'classes/Auth';
import { CONTEXTS, SETTINGS, USER_TYPE } from 'consts';
import { defaultLocalStore } from 'contexts';
import { useAppDispatch, useAppSelector } from 'hooks';

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
				auth.logoutUser();
			}, SETTINGS.LIMITS.TOKEN_PERSIST);
		}
	}, [focus, userData, dispatch]);
}
