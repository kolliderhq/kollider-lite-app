import React, { ReactNode } from 'react';

import cn from 'clsx';

import { CURRENCY } from 'consts/misc/currency';
import { askBidSelector, useOrderbookSelector } from 'contexts';
import { useAppSelector, useSymbolPriceDp } from 'hooks';
import { divide, fixed, multiply } from 'utils/Big';
import { applyDp, formatNumber } from 'utils/format';

export function OrderInfo() {
	const orderData = useAppSelector(state => state.orders.order);
	const { bestAsk, bestBid } = useOrderbookSelector(askBidSelector);

	const validOrder = orderData.leverage > 0 && orderData.quantity >= 1 && bestAsk && bestBid;
	return (
		<div className={cn(validOrder ? 'max-h-[1000px]' : 'max-h-0', 's-transition-maxheight overflow-hidden')}>
			<section
				className={cn(
					's-transition-all w-full pt-10 pb-5 px-3 xs:px-5 xs:pt-12 xs:pb-6 rounded-md border border-gray-600 bg-gray-800 relative'
				)}>
				<div className="absolute left-[10px] top-[6px]">
					<p className="text-gray-200 text-base tracking-widest">Order Info</p>
				</div>
				{validOrder ? <Content /> : <div className="h-[183px]" />}
			</section>
		</div>
	);
}

interface SideBuyData {
	margin: string;
	orderValue: string;
	fees: string;
	isInaccurate: boolean;
}

const Content = () => {
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
};

const getOrderValue = (price, priceDp, quantity) =>
	multiply(divide(CURRENCY.SATS_PER_BTC, applyDp(price, priceDp), 10), quantity, 10);

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
