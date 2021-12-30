import React, { ReactNode } from 'react';

import cn from 'clsx';
import find from 'lodash-es/find';
import findIndex from 'lodash-es/findIndex';
import map from 'lodash-es/map';
import Img from 'next/image';

import { wrapBasePopup } from 'components/dialogs/base';
import Loader from 'components/Loader';
import { QrCode } from 'components/QrCode';
import { useAppDispatch, useAppSelector, useSymbols } from 'hooks';
import { formatNumber } from 'utils/format';

export const InvoicePopup = wrapBasePopup(() => {
	const dispatch = useAppDispatch();
	const { symbolsAssets, symbols } = useSymbols();
	const [{ invoices, symbol }, instantOrders] = useAppSelector(state => [state.invoices, state.trading.instantOrders]);
	const localIndex = findIndex(symbols, v => v === symbol);
	const invoice = invoices[symbol];
	const instantOrder = find(
		map(instantOrders[symbol], order => order),
		// @ts-ignore value is mostly defined
		order => order?.extOrderId === invoice.extOrderId
	);

	React.useEffect(() => {
		console.log('instantOrder', instantOrders, instantOrder, invoice);
	}, [instantOrder]);

	return (
		<div className="w-full h-full mt-5">
			<h2 className="tracking-wider mb-3 text-center">
				<img className="inline mr-2 pb-1" width={28} height={28} src="/assets/common/lightning.svg" />
				Invoice
			</h2>
			<section className="w-full py-3 px-3 xs:py-6 xs:px-6 flex flex-col items-center mt-5">
				{invoice.invoice ? (
					<div className="border-white border-8 mt-2 rounded-lg">
						<div className="border-black border-4 s-qrWrapper">
							<div className="border-white border-8">
								<QrCode autoClick={false} wrapperClass="" size={260} value={invoice.invoice} />
							</div>
						</div>
					</div>
				) : (
					<Loader />
				)}
				<div className="mx-auto max-w-xxxs w-full px-4 mt-4 border border-gray-600 rounded-lg bg-gray-900 py-4">
					<LabelValue label={'Invoice Margin'}>
						{formatNumber(invoice.margin)}
						<span className="pl-1 text-xs">SATS</span>
					</LabelValue>
					<LabelValue label={'Symbol'}>
						<div className="flex items-center">
							<figure className="mr-1 flex items-center">
								<Img width={16} height={16} className="w-4 h-4" src={symbolsAssets[localIndex]} />
							</figure>
							<p className="text-gray-200 text-xs">{symbol.split('.')[0]}</p>
						</div>
					</LabelValue>
					<LabelValue label={'Amount'}>{instantOrder?.quantity}</LabelValue>
					<LabelValue label={'Side'}>
						<span className={cn(instantOrder?.side === 'Bid' ? 'text-green-400' : 'text-red-400')}>
							{instantOrder?.side}
						</span>
					</LabelValue>
					<LabelValue label={'Leverage'}>{instantOrder?.leverage / 100}x</LabelValue>
				</div>
			</section>
		</div>
	);
});

const LabelValue = ({ label, children }: { label: string; children: ReactNode }) => {
	return (
		<div className="flex justify-between items-center mb-0.5 last:mb-0">
			<div className="text-sm">{label}</div>
			<div className="text-sm">{children}</div>
		</div>
	);
};
