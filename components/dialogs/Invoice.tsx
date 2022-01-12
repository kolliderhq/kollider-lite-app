import React, { ReactNode } from 'react';

import cn from 'clsx';
import find from 'lodash-es/find';
import findIndex from 'lodash-es/findIndex';
import map from 'lodash-es/map';
import Img from 'next/image';

import Loader from 'components/Loader';
import { QrCode } from 'components/QrCode';
import { POPUPS, SETTINGS } from 'consts';
import { setPopup } from 'contexts/modules/layout';
import { useAppDispatch, useAppSelector, useSymbols } from 'hooks';
import useTimer from 'hooks/useTimer';
import { formatNumber } from 'utils/format';

export const InvoicePopup = () => {
	const dispatch = useAppDispatch();
	const [time] = useTimer(SETTINGS.LIMITS.INVOICE, () => dispatch(setPopup(POPUPS.NONE)));
	const { symbolsAssets, symbols } = useSymbols();
	const [{ invoices, symbol }, instantOrders] = useAppSelector(state => [state.invoices, state.trading.instantOrders]);
	const localIndex = findIndex(symbols, v => v === symbol);
	const invoice = invoices[symbol];
	const instantOrder = find(
		map(instantOrders[symbol], order => order),
		// @ts-ignore value is mostly defined
		order => order?.extOrderId === invoice.extOrderId
	);

	return (
		<div className="w-full h-full mt-5">
			<h2 className="tracking-wider mb-3 text-center">
				<img className="inline mr-2 pb-1" width={28} height={28} src="/assets/common/lightning.svg" />
				Invoice
			</h2>
			<div className="mt-1.5">
				<p className="text-center">
					Expires in: <span className="font-mono text-red-600">{time / 1000}</span>s
				</p>
			</div>
			<section className="w-full py-3 px-3 xs:py-6 xs:px-6 flex flex-col items-center">
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
};

export const LabelValue = ({ label, children }: { label: string; children: ReactNode }) => {
	return (
		<div className="w-full flex justify-between items-center mb-0.5 last:mb-0">
			<div className="text-sm">{label}</div>
			<div className="text-sm">{children}</div>
		</div>
	);
};
