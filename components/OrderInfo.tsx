import React, { ReactNode } from 'react';

import cn from 'clsx';

import { CURRENCY } from 'consts/misc/currency';
import { askBidSelector, useOrderbookSelector } from 'contexts';
import { useAppSelector, useSymbolPriceDp } from 'hooks';
import { divide, fixed, multiply } from 'utils/Big';
import { applyDp, formatNumber } from 'utils/format';

export function OrderInfo() {
	const { quantity, leverage } = useAppSelector(state => state.orders.order);
	const { bestAsk, bestBid, bestAskAmount, bestBidAmount } = useOrderbookSelector(askBidSelector);
	const priceDp = useSymbolPriceDp();
	const askOrderValue = getOrderValue(bestAsk, priceDp, quantity);
	const askData: SideBuyData = {
		margin: divide(askOrderValue, leverage, 0),
		orderValue: fixed(askOrderValue, 0),
		fees: multiply(CURRENCY.TAKER_FEES, askOrderValue, 0),
		isInaccurate: bestAskAmount < quantity,
	};
	const bidOrderValue = getOrderValue(bestBid, priceDp, quantity);
	const bidData: SideBuyData = {
		margin: divide(bidOrderValue, leverage, 0),
		orderValue: fixed(bidOrderValue, 0),
		fees: multiply(CURRENCY.TAKER_FEES, bidOrderValue, 0),
		isInaccurate: bestBidAmount < quantity,
	};
	return (
		<div className="grid grid-cols-2 gap-2 xs:gap-5 w-full h-full">
			<div className="border border-green-600 border-opacity-75 bg-gray-950 p-4">
				<DisplayOrderData data={askData} />
			</div>
			<div className="border border-red-600 border-opacity-75 bg-gray-950 p-4">
				<DisplayOrderData data={bidData} className="text-right" />
			</div>
		</div>
	);
}

interface SideBuyData {
	margin: string;
	orderValue: string;
	fees: string;
	isInaccurate: boolean;
}

const getOrderValue = (price, priceDp, quantity) => {
	const div = divide(CURRENCY.SATS_PER_BTC, applyDp(price ? price : 1, priceDp), 10);
	return multiply(!isNaN(Number(div)) ? div : 0, quantity ? quantity : 0, 10);
};

const DisplayOrderData = ({ data, className = '' }: { data: SideBuyData; className?: string }) => {
	return (
		<ul className={cn('grid grid-rows-auto gap-3', className)}>
			<li>
				<LabelledValue label={'Margin'} innacurate={data.isInaccurate}>
					{formatNumber(data.margin)}
					<span className="text-[6px]"> </span>
					<span className="text-xs xxs:text-sm xs:text-base break-normal">SATS</span>
				</LabelledValue>
			</li>
			<li>
				<LabelledValue label={'Order Value'} innacurate={data.isInaccurate}>
					{formatNumber(data.orderValue)}
					<span className="text-[6px]"> </span>
					<span className="text-xs xxs:text-sm xs:text-base break-normal">SATS</span>
				</LabelledValue>
			</li>
			<li>
				<LabelledValue label={'Fees'} innacurate={data.isInaccurate}>
					{formatNumber(data.fees)}
					<span className="text-[6px]"> </span>
					<span className="text-xs xxs:text-sm xs:text-base break-normal">SATS</span>
				</LabelledValue>
			</li>
		</ul>
	);
};

const LabelledValue = ({
	label,
	children,
	innacurate,
}: {
	label: string;
	children: ReactNode;
	innacurate: boolean;
}) => {
	return (
		<>
			<p className="text-[11px] leading-tight text-gray-300 tracking-wider">{label}</p>
			<p className="text-sm xxs:text-base xs:text-[18px] break-all leading-none">
				{innacurate && '≈'}
				{children}
			</p>
		</>
	);
};
