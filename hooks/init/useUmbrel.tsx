import React from 'react';

import useSWR from 'swr';

import { auth } from 'classes/Auth';
import { baseSocketClient } from 'classes/SocketClient';
import { baseUmbrelSocketClient } from 'classes/UmbrelSocketClient';
import { API_NAMES, DIALOGS, SETTINGS, UMBREL_MESSAGE_TYPES, USER_TYPE, WS_CUSTOM_TYPES } from 'consts';
import { setIsUmbrelAuthenticated, setIsUmbrelConnected, setViewing } from 'contexts';
import { useAppDispatch, useAppSelector } from 'hooks/redux';
import { fixed } from 'utils/Big';
import { LOG3 } from 'utils/debug';
import { getSWROptions } from 'utils/fetchers';
import { Balances } from 'utils/refiners/sockets';
import { TOAST_LEVEL, displayToast } from 'utils/toast';
import { FixedLengthArray } from 'utils/types/utils';
import { umbrelCheck, umbrelSendPayment, umbrelWithdraw } from 'utils/umbrel';

/**
 * Umbrel uses a work or error approach where if umbrel is unavailable it just throws an error toast
 */
export function useUmbrel() {
	const dispatch = useAppDispatch();
	const isUmbrelAuthenticated = useAppSelector(state => state.connection.isUmbrelAuthenticated);

	useUmbrelAutoLogin();

	//	auto umbrel auth popup
	React.useEffect(() => {
		if (isUmbrelAuthenticated === true) return;
		dispatch(setIsUmbrelAuthenticated(false));
	}, [isUmbrelAuthenticated]);

	React.useEffect(() => {
		if (process.env.NEXT_PUBLIC_UMBREL !== '1') return;
		baseUmbrelSocketClient.connect(
			async () => {
				dispatch(setIsUmbrelConnected(true));
			},
			() => {
				dispatch(setIsUmbrelConnected(false));
				dispatch(setIsUmbrelAuthenticated(false));
				baseUmbrelSocketClient.removeAnyEventListener(processUmbrelMsg);
				displayToast('Umbrel Connection Disconnected', {
					type: 'error',
					level: TOAST_LEVEL.CRITICAL,
					toastId: 'umbrel-connection-disconnected',
				});
			}
		);
	}, []);

	useUmbrelToProcessPayments();
}

const useUmbrelAutoLogin = () => {
	const [loggedIn, apiKey, isUmbrelConnected] = useAppSelector(state => [
		state.user.data.type === USER_TYPE.PRO,
		state.connection.apiKey,
		state.connection.isUmbrelConnected,
	]);
	const { data } = useSWR(
		apiKey && isUmbrelConnected ? [API_NAMES.AUTH_LNURL, apiKey] : undefined,
		getSWROptions(API_NAMES.AUTH_LNURL)
	);

	React.useEffect(() => {
		if (!data?.lnurlAuth || loggedIn) return;
		umbrelLogin(data.lnurlAuth);
	}, [data, loggedIn]);
};

const umbrelLogin = (lnurl: string) => {
	console.log('umbrelLogin attempt', lnurl);
	baseSocketClient.listenOnce(WS_CUSTOM_TYPES.LNURL_AUTH_CREDENTIALS, data => {
		auth.proUserLogin(data);
	});
	baseUmbrelSocketClient.socketSend(UMBREL_MESSAGE_TYPES.AUTH_LNURL, { lnurl }, data => {
		LOG3(data, 'umbrelLogin');
		displayToast('Logged In with Umbrel', {
			type: 'success',
			level: TOAST_LEVEL.INFO,
			toastId: 'umbrel-login-success',
		});
	});
};

const processUmbrelMsg = (data: any) => {
	console.log('Umbrel Event', data);
};

const useUmbrelToProcessPayments = () => {
	const onlyWeblnIfEnabled = true;
	const dispatch = useAppDispatch();
	const [currentDialog, viewing, invoiceStore, isUmbrelConnected, balances] = useAppSelector(state => [
		state.layout.dialog,
		state.invoices.viewing,
		state.invoices,
		state.connection.isUmbrelConnected,
		state.trading.balances,
	]);
	const invoice = invoiceStore.invoices[invoiceStore.symbol]?.invoice;

	//	deposit / instant order invoice
	React.useEffect(() => {
		// console.log('invoice', viewing, invoice, isWeblnConnected);
		if (!viewing || !isUmbrelConnected || !invoice) return;
		umbrelSendPayment(invoice as string, () => {
			if (onlyWeblnIfEnabled) dispatch(setViewing(false));
		});
	}, [viewing]);

	//	settle invoice
	React.useEffect(() => {
		if (currentDialog !== DIALOGS.SETTLE_INVOICE) return;
		if (!isUmbrelConnected) return;
		umbrelWithdraw(Number(fixed(balances.cash, 0)));
	}, [currentDialog, balances]);

	useProcessAutoWithdrawUmbrel();
};

const useProcessAutoWithdrawUmbrel = () => {
	const [isUmbrelConnected, balances, weblnAutoWithdraw] = useAppSelector(state => [
		state.connection.isUmbrelConnected,
		state.trading.balances,
		state.settings.weblnAutoWithdraw,
	]) as FixedLengthArray<[boolean, Balances, number]>;
	const cash = balances?.cash;
	const ref = React.useRef<{ timestamp: number; timeout: ReturnType<typeof setTimeout> }>({
		timestamp: 0,
		timeout: null,
	});
	React.useEffect(() => {
		if (!isUmbrelConnected || weblnAutoWithdraw === 0) return;
		if (Number(cash) >= Number(weblnAutoWithdraw)) {
			ref.current.timestamp = Date.now();
			const current = ref.current.timestamp;
			ref.current.timeout = setTimeout(() => {
				if (current !== ref.current.timestamp) return;
				umbrelWithdraw(Number(fixed(cash, 0)));
			}, SETTINGS.LIMITS.WEBLN_WITHDRAW_TIMEOUT_MS);
		} else {
			//	cash was below the limit when requested
			if (ref.current.timeout) clearTimeout(ref.current.timeout);
		}
	}, [isUmbrelConnected, cash, weblnAutoWithdraw]);
};
