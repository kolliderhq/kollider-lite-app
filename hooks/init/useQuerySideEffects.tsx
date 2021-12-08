import * as React from 'react';

import empty from 'is-empty';
import { useRouter } from 'next/router';

import { defaultLocalStore } from 'contexts/custom/localStore';
import { setSymbolLoad, setUtmSource } from 'contexts/modules/misc';
import { useAppDispatch, useAppSelector } from 'hooks/redux';

// import { displayToast } from 'utils/toast';

export default function useQuerySideEffects() {
	const history = useRouter();
	const dispatch = useAppDispatch();
	const [userType, token] = useAppSelector(state => [state.user.data.type, state.user.data.token]);

	//	accessing through /auth/login
	React.useLayoutEffect(() => {
		if (history.pathname !== '/auth/login' || !history.isReady) return;
		if (empty(history.query) || !history.query?.token) {
			// displayToast('Please login through Breez', 'error', null, 'Login Error');
			history.push('/', undefined, { shallow: true });
			return;
		}
		const token = history.query.token;
		defaultLocalStore.cookieSet('FULL_USER_REFRESH', token);
		defaultLocalStore.cookieSet('FULL_USER', {
			token: token,
			email: '',
			type: 'pro',
		});
		history.push('/', undefined, { shallow: true });
	}, [history]);

	// for when accessing through '/'
	// remember utm_source and symbol
	React.useEffect(() => {
		if (history.pathname !== '/' || !history.isReady) return;
		if (token === '' || empty(history.query)) return;
		const query = history.query;

		if (query?.symbol) {
			alert(`applying short symbol - ${query.symbol}`);
			dispatch(setSymbolLoad(query.symbol as string));
		}

		if (query?.utm_source) {
			const source = query.utm_source;
			dispatch(setUtmSource(source as string));
		}
		history.replace('/', undefined, { shallow: true });
	}, [history, dispatch, token, userType]);
}
