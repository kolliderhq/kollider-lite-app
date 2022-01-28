import { setWeblnConnected, storeDispatch } from 'contexts';
import { TBigInput } from 'utils/Big';
import { TOAST_LEVEL, displayToast } from 'utils/toast';
import { RequestInvoiceResponse, WebLNProvider, requestProvider } from 'utils/vendor/webln';

export const weblnInit = async (hideToast?: boolean): Promise<WebLNProvider | null> => {
	try {
		return await requestProvider();
	} catch (err) {
		if (!hideToast)
			displayToast(
				<p className="text-sm">
					There was an error initializing webln
					<br />
					<span className="text-xs">⚠️ {err.message}</span>
				</p>,
				{
					type: 'error',
					level: TOAST_LEVEL.IMPORTANT,
				}
			);
		console.log('Webln request provider error', err.message);
		return null;
	}
};

export const weblnWithdraw = async (inputState: {
	amount: TBigInput;
}): Promise<RequestInvoiceResponse | { error: string; locked: boolean }> => {
	const webln = await weblnInit();
	if (webln) {
		try {
			displayToast('Requested Withdraw via Webln', {
				type: 'dark',
				level: TOAST_LEVEL.VERBOSE,
				toastId: 'webln-withdraw',
				toastOptions: { position: 'bottom-center' },
			});
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
	try {
		const webln = await weblnInit();
		if (webln) {
			displayToast('Requested Payment via Webln', {
				type: 'dark',
				level: TOAST_LEVEL.VERBOSE,
				toastId: 'webln-payment',
				toastOptions: { position: 'bottom-center' },
			});
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
		} else {
			displayToast(
				<p className="text-sm">
					There was an error initializing webln
					<br />
					<span className="text-xs">⚠️ Webln not detected</span>
				</p>,
				{
					type: 'error',
					level: TOAST_LEVEL.IMPORTANT,
				}
			);
			storeDispatch(setWeblnConnected(false));
		}
	} catch (ex) {
		console.error('webln send payment exception >>>', ex);
		displayToast(
			<p className="text-sm">
				There was an error initializing webln
				<br />
				<span className="text-xs">⚠️ {ex.message}</span>
			</p>,
			{
				type: 'error',
				level: TOAST_LEVEL.IMPORTANT,
			}
		);
		storeDispatch(setWeblnConnected(false));
	}
};
