import React from 'react';

// eslint-disable-next-line prettier/prettier
import { RequestInvoiceResponse, WebLNProvider } from 'webln';

import { baseSocketClient } from 'classes/SocketClient';
import { MESSAGE_TYPES } from 'consts';
import { DIALOGS } from 'consts';
import { SETTINGS } from 'consts';
import { setViewing, setWeblnConnected } from 'contexts';
import { reduxStore } from 'contexts';
import { setDialog } from 'contexts/modules/layout';
import { useAppDispatch, useAppSelector } from 'hooks';
import { TBigInput } from 'utils/Big';
import { Balances, OrderInvoice } from 'utils/refiners/sockets';
import { FixedLengthArray } from 'utils/types/utils';
// import { displayToast } from 'utils/toast';
import { weblnInit, weblnSendPayment, weblnWithdraw } from 'utils/webln';

export const useWebln = () => {
	const dispatch = useAppDispatch();
	//	initialize webln - runs on startup
	React.useEffect(() => {
		weblnInit().then(res => {
			if (!res) return;
			res
				.enable()
				.then(() => {
					console.log('webln enabled');
					dispatch(setWeblnConnected(true));
				})
				.catch(() => {
					dispatch(setWeblnConnected(false));
					console.log('webln disabled');
				});

			res.getInfo().then(info => {
				if (info?.node?.alias) {
					console.log('webln connected', info.node.alias);
					// displayToast(
					// 	<p className="text-sm">
					// 		Wallet [<span className="font-bold">{info.node.alias}</span>]
					// 		<br />
					// 		was successfully loaded
					// 	</p>,
					// 	'dark',
					// 	null,
					// 	'WebLn Found',
					// 	true
					// );
				} else {
					// displayToast(
					// 	<p className="text-sm">
					// 		Please unlock your wallet
					// 		<br />
					// 		and refresh the page
					// 	</p>,
					// 	'error',
					// 	null,
					// 	'WebLn Wallet inaccessible',
					// 	true
					// );
				}
			});
		});
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
		!!state.settings.weblnAutoWithdraw,
	]) as FixedLengthArray<[boolean, Balances, boolean]>;
	const cash = balances?.cash;

	// throttles withdrawals for WEBLN_WITHDRAW_TIMEOUT_MS and checks if there were new changes to cash.
	// Only withdraws after no changes in WEBLN_WITHDRAW_TIMEOUT_MS
	const ref = React.useRef<{ timestamp: number; timeout: ReturnType<typeof setTimeout> }>({
		timestamp: 0,
		timeout: null,
	});
	React.useEffect(() => {
		if (!isWeblnConnected || !weblnAutoWithdraw) return;
		if (Number(cash) >= 1) {
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
