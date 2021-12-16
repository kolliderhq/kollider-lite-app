import React from 'react';

import { MESSAGE_TYPES } from 'constants/websocket';

// eslint-disable-next-line prettier/prettier
import { RequestInvoiceResponse, WebLNProvider } from 'webln';

import { baseSocketClient } from 'classes/SocketClient';
import { DIALOGS } from 'consts';
import { SETTINGS } from 'consts';
import { setWeblnConnected } from 'contexts';
import { reduxStore } from 'contexts';
import { updateInvoiceStore, useInvoiceStore } from 'contexts/invoiceStore';
import { setCurrentModal } from 'contexts/modules/layout';
import { useSettingsStore } from 'contexts/settingsStore';
import { SBalances, getTradingStoreValue, useTradingStore } from 'contexts/tradingStore';
import { useAppDispatch, useAppSelector } from 'hooks';
import { TBigInput } from 'utils/Big';
import { AddMarginRequest, OrderInvoice } from 'utils/refiners/sockets';
// import { displayToast } from 'utils/toast';
import { weblnInit, weblnSendPayment, weblnWithdraw } from 'utils/webln';

export const useWebln = () => {
	const dispatch = useAppDispatch();
	//	initialize webln - runs on startup
	React.useEffect(() => {
		weblnInit().then(res => {
			if (!res) return;
			res.getInfo().then(info => {
				if (info?.node?.alias) {
					dispatch(setWeblnConnected(true));
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
					dispatch(setWeblnConnected(false));
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

	const [{ viewing, webln }] = useInvoiceStore(['viewing', 'webln']) as [
		{ viewing: boolean; webln: WebLNProvider | null }
	];
	const [onlyWeblnIfEnabled] = useAppSelector(state => [state.settings.onlyWeblnIfEnabled]);
	const [invoices] = useInvoiceStore() as [{ symbol: string } & { [symbol: string]: OrderInvoice }];
	const symbol = invoices.symbol;
	const invoice = invoices?.[symbol]?.invoice;
	const changeMargin = invoices?.changeMargin as unknown as AddMarginRequest | null;

	//	deposit / instant order invoice
	React.useEffect(() => {
		if (!viewing || !webln || !invoice) return;
		weblnSendPayment(invoice, () => {
			if (onlyWeblnIfEnabled) updateInvoiceStore({ viewing: false });
		});
	}, [viewing]);

	const currentDialog = useAppSelector(state => state.layout.dialog);

	//	change margin invoice
	React.useEffect(() => {
		if (currentDialog === DIALOGS.CHANGE_MARGIN_INVOICE && changeMargin) {
			if (!webln) return;
			weblnSendPayment(changeMargin.invoice, () => {
				if (onlyWeblnIfEnabled) dispatch(setCurrentModal(DIALOGS.NONE));
			});
		}
		// updateInvoiceStore({ changeMargin: data });
	}, [currentDialog]);

	//	settle invoice
	React.useEffect(() => {
		if (currentModal !== DIALOGS.SETTLE_INVOICE) return;
		if (!webln) return;
		console.log('webln>>>>', webln);
		const balances = getTradingStoreValue('balances');
		withdrawWebln(balances?.cash);
	}, [currentDialog]);
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
			reduxStore.dispatch(setCurrentModal(DIALOGS.NONE));
		});
};

const useProcessAutoWithdrawWebln = () => {
	const [webln] = useInvoiceStore('webln') as [WebLNProvider | null];
	const [balances] = useTradingStore('balances') as [SBalances];
	const [weblnAutoWithdraw] = useSettingsStore('weblnAutoWithdraw') as [number];
	const cash = balances?.cash;

	// throttles withdrawals for WEBLN_WITHDRAW_TIMEOUT_MS and checks if there were new changes to cash.
	// Only withdraws after no changes in WEBLN_WITHDRAW_TIMEOUT_MS
	const ref = React.useRef<{ timestamp: number; timeout: ReturnType<typeof setTimeout> }>({
		timestamp: 0,
		timeout: null,
	});
	React.useEffect(() => {
		if (!webln || weblnAutoWithdraw <= 0) return;
		console.log(cash);
		if (Number(cash) >= weblnAutoWithdraw) {
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
	}, [webln, cash]);
};
