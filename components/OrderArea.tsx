import React from 'react';

import cn from 'clsx';

import { TOrderbook } from 'classes/Orderbook';
import { useOrderbookSelector } from 'contexts';
import { useSymbolPriceDp } from 'hooks';
import { applyDp, formatNumber } from 'utils/format';

const askBidSelector = (data: TOrderbook) => {
	const bestAsk = data.asks[data.asks.length - 1]?.[0];
	const bestBid = data.bids[0]?.[0];
	return {
		bestAsk,
		bestBid,
	};
};
const buttonClass =
	'row-span-2 xs:row-span-1 col-span-1 xs:col-span-2 border-2 border-transparent rounded shadow-elevation-08dp flex flex-col justify-center items-center s-transition-all-fast hover:opacity-80';
export const OrderArea = () => {
	const { bestAsk, bestBid } = useOrderbookSelector(askBidSelector);
	const priceDp = useSymbolPriceDp();
	return (
		<section className="w-full grid grid-rows-7 xs:grid-rows-1 grid-cols-1 xs:grid-cols-7 h-80 xs:h-20 w-full gap-2">
			<button
				onClick={() => {}}
				className={cn(buttonClass, 'bg-green-600', {
					'opacity-50': !bestAsk,
				})}>
				<p>Buy / Long</p>
				<p>{bestAsk && <>${formatNumber(applyDp(bestAsk, priceDp))}</>}</p>
			</button>
			<div className="col-span-1 xs:col-span-3 row-span-3 xs:row-span-1">
				<OrderInput />
			</div>
			<button onClick={() => {}} className={cn(buttonClass, 'bg-red-500', { 'opacity-50': !bestBid })}>
				<p>Sell / Short</p>
				<p>{bestBid && <>${formatNumber(applyDp(bestBid, priceDp))}</>}</p>
			</button>
		</section>
	);
};

const OrderInput = () => {
	return (
		<div className="flex flex-col items-center justify-center">
			<p className="text-gray-400">Quantity</p>
		</div>
	);
};
