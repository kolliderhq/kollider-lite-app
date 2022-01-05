import React from 'react';

import { baseSocketClient } from 'classes/SocketClient';
import { LabelValue } from 'components/dialogs/Invoice';
import Loader from 'components/Loader';
import { QrCode } from 'components/QrCode';
import { DIALOGS, MESSAGE_TYPES, SETTINGS, TRADING_TYPES } from 'consts';
import { setDialog } from 'contexts/modules/layout';
import { useAppDispatch, useAppSelector } from 'hooks';
import useTimer from 'hooks/useTimer';
import { formatNumber } from 'utils/format';

export const WithdrawAvailableDialog = () => {
	const balances = useAppSelector(state => state.trading.balances);
	const dispatch = useAppDispatch();
	const [time] = useTimer(SETTINGS.LIMITS.INVOICE, () => dispatch(setDialog(DIALOGS.NONE)));
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
			<h4 className="tracking-wider mb-3 text-center">Withdraw Margin</h4>
			<section className="w-full py-3 px-3 xs:py-6 xs:px-6 flex flex-col items-center mt-5">
				<div className="my-1.5 w-full">
					<p className="text-center">
						Expires in: <span className="font-mono text-red-600">{time / 1000}</span>s
					</p>
				</div>
				<div className="container-spacious mb-3">
					<LabelValue label={'Margin'}>
						<p>
							{formatNumber(amount)}
							<span className="pl-1 text-xs">SATS</span>
						</p>
					</LabelValue>
				</div>

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
};
