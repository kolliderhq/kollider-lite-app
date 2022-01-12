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

export const weblnConnectAttempt = () => {
	weblnInit().then(res => {
		if (!res) {
			storeDispatch(setWeblnConnected(false));
			return;
		}
		console.log('webln >>', res);
		// // sendPayment is not active - wallet is locked in extension
		// const keys = Object.keys(res);
		// console.log('res', keys);
		// if (!keys.includes('sendPayment')) {
		// 	storeDispatch(setWeblnConnected(false));
		// 	displayToast(
		// 		<p className="text-sm">
		// 			Please unlock your Webln wallet
		// 			<br />
		// 			and try to connect again
		// 		</p>,
		// 		{
		// 			type: 'warning',
		// 			level: TOAST_LEVEL.CRITICAL,
		// 			toastId: 'webln-disabled',
		// 		}
		// 	);
		// 	return;
		// } else {
		// 	//	sendPayment is active - webln on mobile or desktop extension
		storeDispatch(setWeblnConnected(true));
		displayToast(<p>Webln detected</p>, {
			type: 'info',
			level: TOAST_LEVEL.INFO,
			toastId: 'webln-found',
		});
		// }
	});
};

export const useWebln = () => {
	const dispatch = useAppDispatch();
	//	initialize webln - runs on startup
	React.useEffect(() => {
		weblnConnectAttempt();
		if (detectMobile())
			setTimeout(() => {
				if (!reduxStore.getState().connection.isWeblnConnected) {
					weblnConnectAttempt();
				}
			}, 3000);
	}, []);

	useProcessAutoWithdrawWebln();

	const [onlyWeblnIfEnabled, currentDialog, invoiceStore, isWeblnConnected, balances] = useAppSelector(state => [
		state.settings.onlyWeblnIfEnabled,
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
	}, [isWeblnConnected, cash]);
};

function detectMobile() {
	if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) return true;
	return false;
}
