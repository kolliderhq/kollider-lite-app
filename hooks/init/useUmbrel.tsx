import React from 'react';

import { baseUmbrelSocketClient } from 'classes/UmbrelSocketClient';
import { DIALOGS } from 'consts';
import { setIsUmbrelConnected, setViewing } from 'contexts';
import { useAppDispatch, useAppSelector } from 'hooks/redux';
import { fixed } from 'utils/Big';
import { TOAST_LEVEL, displayToast } from 'utils/toast';
import { umbrelCheck, umbrelSendPayment, umbrelWithdraw } from 'utils/umbrel';

/**
 * Umbrel uses a work or error approach where if umbrel is unavailable it just throws an error toast
 */
export function useUmbrel() {
	const dispatch = useAppDispatch();

	React.useEffect(() => {
		if (process.env.NEXT_PUBLIC_UMBREL !== '1') return;
		baseUmbrelSocketClient.connect(
			async () => {
				dispatch(setIsUmbrelConnected(true));
				const res = await umbrelCheck();
				if (res) {
					displayToast('Umbrel is connected!', {
						type: 'success',
						level: TOAST_LEVEL.INFO,
						toastId: 'umbrel-connection-success',
					});
					baseUmbrelSocketClient.addAnyEventListener(processUmbrelMsg);
				} else {
					//	should never be envoked normally
					console.error('Umbrel check res >>>', res);
				}
			},

			() => {
				dispatch(setIsUmbrelConnected(false));
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

const processUmbrelMsg = (data: any) => {
	console.log('Umbrel Event', data);
};

const useUmbrelToProcessPayments = () => {
	const onlyWeblnIfEnabled = true;
	const dispatch = useAppDispatch();
	const [currentDialog, viewing, invoiceStore, isWeblnConnected, balances] = useAppSelector(state => [
		state.layout.dialog,
		state.invoices.viewing,
		state.invoices,
		state.connection.isWeblnConnected || process.env.NEXT_PUBLIC_UMBREL === '1',
		state.trading.balances,
	]);
	const invoice = invoiceStore.invoices[invoiceStore.symbol]?.invoice;

	//	deposit / instant order invoice
	React.useEffect(() => {
		// console.log('invoice', viewing, invoice, isWeblnConnected);
		if (!viewing || !isWeblnConnected || !invoice) return;
		umbrelSendPayment(invoice as string, () => {
			if (onlyWeblnIfEnabled) dispatch(setViewing(false));
		});
	}, [viewing]);

	//	settle invoice
	React.useEffect(() => {
		if (currentDialog !== DIALOGS.SETTLE_INVOICE) return;
		if (!isWeblnConnected) return;
		umbrelWithdraw(Number(fixed(balances.cash, 0)));
	}, [currentDialog, balances]);
};
