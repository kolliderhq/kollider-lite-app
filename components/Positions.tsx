import React from 'react';

import cn from 'clsx';
import Img from 'next/image';

import { processOrder } from 'components/OrderArea';
import { Order, Side } from 'contexts';
import { useAppSelector, useSymbolData, useSymbols } from 'hooks';
import { fixed } from 'utils/Big';
import { formatNumber, formatUSD } from 'utils/format';
import { isNumber } from 'utils/scripts';

export const PositionTable = () => {
	const { symbol } = useSymbols();
	const { positions, balances } = useAppSelector(state => state.trading);
	const position = positions[symbol];

	const positionMargin = React.useMemo(() => {
		if (!isNumber(balances?.isolatedMargin?.[symbol])) return '0';
		return formatNumber(fixed(balances?.isolatedMargin?.[symbol], 0));
	}, [balances?.isolatedMargin, symbol]);

	const hasPosition = position?.quantity ? position.quantity !== '0' : false;
	return (
		<section className="grid grid-rows-[fit-content(100%),1fr] xxs:grid-rows-1 grid-cols-1 xxs:grid-cols-3 gap-1">
			<div className="py-2 xxs:py-0 xxs:col-span-1 w-full h-full">
				<div className="grid grid-cols-2 xxs:flex flex-col items-center justify-center h-full gap-y-2 gap-x-3">
					<PositionData />
					<ClosePosition />
				</div>
			</div>
			<div className="col-span-2 grid grid-cols-2 xs:grid-cols-2 grid-rows-2 gap-x-1 xxs:gap-x-2 gap-y-2 w-full xs:px-5 sm:px-0">
				<LabelledValue label="Invested SATS" value={hasPosition ? positionMargin : '-'} />
				<LabelledValue label="Amount" value={hasPosition ? position?.quantity : '-'} />
				<LabelledValue label="Purchase Price" value={hasPosition ? formatUSD(position?.entryPrice) : '-'} />
				<LabelledValue label="Liq. Price" value={hasPosition ? formatUSD(position?.liqPrice) : '-'} />
			</div>
		</section>
	);
};

const ClosePosition = () => {
	const { symbol } = useSymbols();
	const { priceDp } = useSymbolData();
	const positions = useAppSelector(state => state.trading.positions);
	const position = positions[symbol];
	const hasPosition = position?.quantity ? position.quantity !== '0' : false;
	const onClosePosition = React.useCallback(() => {
		if (!hasPosition) return;
		const order = {
			quantity: Number(position.quantity),
			leverage: Number(position.leverage),
			isInstant: true,
		} as Order;
		processOrder(order, position.side === 'Ask' ? Side.BID : Side.ASK, priceDp, symbol);
	}, [hasPosition, position, priceDp, symbol]);
	return (
		<button
			onClick={onClosePosition}
			className={cn(
				hasPosition ? 'hover:opacity-80 cursor-pointer' : 'opacity-50 cursor-not-allowed',
				'flex items-center justify-center border border-theme-main rounded-md py-1 px-1.5'
			)}
		>
			<p className="text-[10px]">Close Position</p>
		</button>
	);
};

export const LabelledValue = ({ label, value, className }: { label: string; value: string; className?: string }) => {
	return (
		<div className={cn('flex flex-col items-center justify-center gap-2 sm:gap-0.5 h-10 xxs:h-14', className)}>
			<p className="leading-none tracking-tight text-xs sm:text-sm text-gray-400 text-center">{label}</p>
			<p className="leading-none tracking-normal text-base sm:text-lg text-right">{value}</p>
		</div>
	);
};

const PositionData = () => {
	const { symbol } = useSymbols();
	const positions = useAppSelector(state => state.trading.positions);
	const position = positions[symbol];

	const hasPosition = position?.quantity ? position.quantity !== '0' : false;
	const largeAsset = React.useMemo(() => {
		return `/assets/coin-logo-large/${symbol.substring(0, 3)}.png`;
	}, [symbol]);
	return (
		<div
			style={{
				background: `linear-gradient(0deg, ${
					hasPosition ? (position.side === 'Bid' ? longColor : shortColor) : 'rgba(38,41,50,1)'
				} 0%,  rgba(38,41,50,1) 100%)`,
			}}
			className={cn(
				'bg-gray-700 rounded-lg flex flex-col items-center justify-center px-2 py-2 xxs:py-3 min-w-[100px] xs:h-20'
			)}
		>
			<div className="flex flex-col items-center gap-0.5">
				<div className="flex items-center gap-1 mb-0.5">
					<Img width={18} height={18} className="rounded-full" src={largeAsset} />
					<p
						data-cy="overview-side"
						className={cn(
							'text-base',
							hasPosition ? (position.side === 'Bid' ? 'text-green-400' : 'text-red-400') : 'text-gray-100'
						)}
					>
						{hasPosition ? (position.side === 'Bid' ? ' Long' : ' Short') : '  '}
					</p>
				</div>
			</div>
			<p className="text-base">{hasPosition ? `${position.leverage}x` : '-'}</p>
		</div>
	);
};

const longColor = 'rgba(34,62,56,1)';
const shortColor = 'rgba(220, 38, 38, 0.25)';
