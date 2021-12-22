import { RequestInvoiceResponse, WebLNProvider, requestProvider } from 'webln';

import { TBigInput } from 'utils/Big';

// import { displayToast } from 'utils/toast';

export const weblnInit = async (): Promise<WebLNProvider | null> => {
	try {
		return await requestProvider();
	} catch (err) {
		console.log('Webln request provider error', err.message);
		return null;
	}
};

export const weblnWithdraw = async (inputState: {
	amount: TBigInput;
}): Promise<RequestInvoiceResponse | { error: string; locked: boolean }> => {
	const webln = await weblnInit();
	if (webln) {
		console.log('init webln', webln);
		try {
			const result = await webln.makeInvoice({
				amount: inputState.amount,
				defaultAmount: inputState.amount,
				defaultMemo: `Kollider Withdrawal ${inputState.amount} SATS`,
			});
			if (result === undefined) {
				return { error: 'Wallet is Locked. Unlock wallet and try again', locked: true };
			}
			return result;
		} catch (e) {
			return { error: 'Invoice was rejected', locked: false };
		}
	}
	return { error: 'Webln not detected', locked: true };
};

export const weblnSendPayment = async (invoice: string, finallyCallback?: () => void) => {
	const webln = await weblnInit();
	console.log('webln', webln);
	if (webln) {
		webln
			.sendPayment(invoice)
			.then(res => {
				console.log('payment callback >>>', res);
			})
			.catch(ex => {
				console.error('payment exception >>>', ex);
				// displayToast('Webln Wallet is Locked. Unlock wallet and try again', 'error', null, 'WebLn Error', true);
			})
			.finally(finallyCallback);
	}
};
