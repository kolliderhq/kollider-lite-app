import React from 'react';

import { setPaymentInTransit, storeDispatch } from 'contexts';
import { useAppSelector } from 'hooks/redux';
import { TOAST_LEVEL, displayToast } from 'utils/toast';

export const TransactionProcessingInfo = () => {

	const [paymentInTransit] = useAppSelector(state => [state.payments.paymentInTransit]);
	// Timeout in case payment times out. Make use aware that it might happen in the future.
	React.useEffect(() => {
		if (paymentInTransit === true) {
			setTimeout(paymentInTransit => {
				console.log('called timeout');
				if (paymentInTransit === true) {
					displayToast('Payment timed out but might sill be confirmed in the future.', {
						type: 'error',
						level: TOAST_LEVEL.CRITICAL,
						toastId: 'umbrel-payment-timeout',
					});
					storeDispatch(setPaymentInTransit(false));
				}
			}, 5000);
		}
	}, [paymentInTransit]);

	return (
		<div className="fixed w-42 bottom-3 left-3 rounded bg-gray-900 animate-pulse text-center z-100">
			<div className="p-4 text-xl text-white">Sending Payment ⚡</div>
		</div>
	);
};
