import React from 'react';

import { baseSocketClient } from 'classes/SocketClient';
import { wrapBaseDialog, wrapBasePopup } from 'components/dialogs/base';
import Loader from 'components/Loader';
import { QrCode } from 'components/QrCode';
import { MESSAGE_TYPES, TRADING_TYPES } from 'consts';
import { useAppSelector } from 'hooks';

export const WithdrawAvailableDialog = wrapBaseDialog(() => {
	const balances = useAppSelector(state => state.trading.balances);
	const [amount, setAmount] = React.useState(null);
	const [invoice, setInvoice] = React.useState(null);
	const [invoiceAmount, setInvoiceAmount] = React.useState(null);

	React.useEffect(() => {
		if (amount || !balances) return;
		setAmount(Math.floor(Number(balances?.cash)));
	}, [balances, amount]);

	React.useEffect(() => {
		if (!amount) return;
		const body = { amount };
		baseSocketClient.socketSend(
			MESSAGE_TYPES.WITHDRAWAL_REQUEST,
			body,
			v => {
				setInvoice(v?.lnurl);
				setInvoiceAmount(v?.amount);
			},
			{ type: TRADING_TYPES.LNURL_WITHDRAWAL_REQUEST }
		);
	}, [amount]);
	return (
		<div className="w-full h-full mt-10">
			<h4 className="tracking-wider mb-3 text-center">Withdraw Available Margin</h4>
			<section className="w-full py-3 px-3 xs:py-6 xs:px-6 flex flex-col items-center mt-5">
				{invoice ? (
					<div className="border-white border-8 mt-2 rounded-lg">
						<div className="border-black border-4 s-qrWrapper">
							<div className="border-white border-8">
								<QrCode autoClick={false} wrapperClass="" size={260} value={invoice} />
							</div>
						</div>
					</div>
				) : (
					<Loader />
				)}
			</section>
		</div>
	);
});
