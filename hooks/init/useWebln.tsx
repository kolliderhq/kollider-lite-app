import React from 'react';

import { baseSocketClient } from 'classes/SocketClient';
import { DIALOGS, MESSAGE_TYPES, SETTINGS } from 'consts';
import { reduxStore, setViewing, setWeblnConnected, storeDispatch } from 'contexts';
import { setDialog } from 'contexts/modules/layout';
import { useAppDispatch, useAppSelector } from 'hooks';
import { TBigInput } from 'utils/Big';
import { Balances } from 'utils/refiners/sockets';
import { TOAST_LEVEL, displayToast } from 'utils/toast';
import { FixedLengthArray } from 'utils/types/utils';
import { RequestInvoiceResponse, WebLNProvider } from 'utils/vendor/webln';
import { weblnInit, weblnSendPayment, weblnWithdraw } from 'utils/webln';

export const weblnConnectAttempt = (hideToast?: boolean) => {
	weblnInit(hideToast).then(res => {
		if (!res) {
			storeDispatch(setWeblnConnected(false));
			return;
		}
		console.log('webln >>', res);
		storeDispatch(setWeblnConnected(true));
		displayToast(<p>Webln detected</p>, {
			type: 'info',
			level: TOAST_LEVEL.VERBOSE,
			toastId: 'webln-found',
		});
		// }
	});
};

export const useWebln = () => {
	const dispatch = useAppDispatch();
	//	initialize webln - runs on startup
	React.useEffect(() => {
		weblnConnectAttempt(true);
		if (detectMobile())
			setTimeout(() => {
				if (!reduxStore.getState().connection.isWeblnConnected) {
					weblnConnectAttempt();
				}
			}, 3000);
	}, []);

	useProcessAutoWithdrawWebln();

	// TODO : same code in useUmbrel using umbrel - package this part into a single class in the future
	const [onlyWeblnIfEnabled, currentDialog, invoiceStore, isWeblnConnected, balances] = useAppSelector(state => [
		state.settings.onlyWeblnIfEnabled || process.env.NEXT_PUBLIC_UMBREL === '1',
		state.layout.dialog,
		state.invoices,
		state.connection.isWeblnConnected,
		state.trading.balances,
	]);
	const viewing = invoiceStore.viewing;
	const invoice = invoiceStore.invoices[invoiceStore.symbol]?.invoice;
	//	deposit / instant order invoice
	React.useEffect(() => {
		// console.log('invoice', viewing, invoice, isWeblnConnected);
		if (!viewing || !isWeblnConnected || !invoice) return;
		weblnSendPayment(invoice as string, () => {
			if (onlyWeblnIfEnabled) dispatch(setViewing(false));
		});
	}, [viewing]);

	//	settle invoice
	React.useEffect(() => {
		if (currentDialog !== DIALOGS.SETTLE_INVOICE) return;
		if (!isWeblnConnected) return;
		withdrawWebln(balances.cash);
	}, [currentDialog, balances]);
};

const withdrawWebln = (inputAmount: TBigInput) => {
	const amount = Math.floor(Number(inputAmount));
	weblnWithdraw({ amount })
		.then(res => {
			console.log('weblnWithdraw then', res);
			if ((res as { error: string })?.error) {
				const result = res as { error: string; locked: boolean };
				// displayToast(result.error, 'error', null, 'Webln Error');
				// if (result.locked) {
				// 	updateInvoiceStore({ webln: false });
				// }
				return;
			} else {
				const body = { amount: Number(amount), invoice: (res as RequestInvoiceResponse).paymentRequest };
				baseSocketClient.socketSend(MESSAGE_TYPES.WITHDRAWAL_REQUEST, body);
			}
		})
		.finally(() => {
			reduxStore.dispatch(setDialog(DIALOGS.NONE));
		});
};

const useProcessAutoWithdrawWebln = () => {
	const [isWeblnConnected, balances, weblnAutoWithdraw] = useAppSelector(state => [
		state.connection.isWeblnConnected,
		state.trading.balances,
		state.settings.weblnAutoWithdraw,
	]) as FixedLengthArray<[boolean, Balances, number]>;
	const cash = balances?.cash;

	// throttles withdrawals for WEBLN_WITHDRAW_TIMEOUT_MS and checks if there were new changes to cash.
	// Only withdraws after no changes in WEBLN_WITHDRAW_TIMEOUT_MS
	const ref = React.useRef<{ timestamp: number; timeout: ReturnType<typeof setTimeout> }>({
		timestamp: 0,
		timeout: null,
	});
	React.useEffect(() => {
		if (!isWeblnConnected || weblnAutoWithdraw === 0) return;
		if (Number(cash) >= Number(weblnAutoWithdraw)) {
			ref.current.timestamp = Date.now();
			const current = ref.current.timestamp;
			ref.current.timeout = setTimeout(() => {
				if (current !== ref.current.timestamp) return;
				withdrawWebln(cash);
			}, SETTINGS.LIMITS.WEBLN_WITHDRAW_TIMEOUT_MS);
		} else {
			//	cash was below the limit when requested
			if (ref.current.timeout) clearTimeout(ref.current.timeout);
		}
	}, [isWeblnConnected, cash, weblnAutoWithdraw]);
};

function detectMobile() {
	if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) return true;
	return false;
}
