import { baseUmbrelSocketClient } from 'classes/UmbrelSocketClient';
import { UMBREL_MESSAGE_TYPES } from 'consts';
import { TOAST_LEVEL, displayToast } from 'utils/toast';

export const umbrelCheck = async (): Promise<boolean> => {
	return new Promise((resolve, reject) => {
		baseUmbrelSocketClient.socketSend(UMBREL_MESSAGE_TYPES.GET_NODE_INFO, null, data => {
			if (!data.data) {
				displayToast('Umbrel Connection Failed', {
					type: 'error',
					level: TOAST_LEVEL.CRITICAL,
					toastId: 'umbrel-connection-failed',
				});
				resolve(false);
				return;
			}
			// console.log('getNodeInfo', data.data);
			resolve(true);
			return;
		});
	});
};

export const umbrelSendPayment = async (invoice: string, finallyCallback?: (data: any) => void) => {
	try {
		console.log('umbrelSendPayment');
		// const res = await umbrelCheck();
		// if (!res) {
		// 	displayToast('Umbrel Connection Failed', {
		// 		type: 'error',
		// 		level: TOAST_LEVEL.CRITICAL,
		// 		toastId: 'umbrel-connection-failed',
		// 	});
		// 	return;
		// }
		baseUmbrelSocketClient.socketSend(UMBREL_MESSAGE_TYPES.SEND_PAYMENT, { paymentRequest: invoice }, finallyCallback);
	} catch (ex) {
		console.error('Umbrel payment error', ex);
		displayToast('Umbrel Payment Error - try again', {
			type: 'error',
			level: TOAST_LEVEL.CRITICAL,
			toastId: 'umbrel-payment-error',
		});
	}
};

export const umbrelWithdraw = (amount: number, finallyCallback?: (res: any) => void) => {
	return new Promise(async (resolve, reject) => {
		try {
			const res = await umbrelCheck();
			if (!res) {
				reject('Umbrel not connected');
				displayToast('Umbrel Connection Failed', {
					type: 'error',
					level: TOAST_LEVEL.CRITICAL,
					toastId: 'umbrel-connection-failed',
				});
				return;
			}

			baseUmbrelSocketClient.socketSend(UMBREL_MESSAGE_TYPES.CREATE_INVOICE, { amount }, data => {
				console.log('CREATE_INVOICE', data);
				resolve(data);
				finallyCallback(data);
			});
		} catch (ex) {
			console.error('Umbrel withdraw error', ex);
			displayToast('Umbrel Withdraw Error - try again', {
				type: 'error',
				level: TOAST_LEVEL.CRITICAL,
				toastId: 'umbrel-withdraw-error',
			});
		}
	});
};
