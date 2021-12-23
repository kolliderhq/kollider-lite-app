import React from 'react';

import cn from 'clsx';
import Img from 'next/image';

import { useAppSelector, useSymbols } from 'hooks';
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
		<section className="flex justify-center items-center w-full xs:px-2 xs:pt-2">
			<PositionData />
			<div className="grid grid-cols-2 xs:grid-cols-3 grid-rows-2 gap-x-2 gap-y-3 w-full">
				<LabelledValue className="col-span-2 xs:col-span-1" label="PNL" value={hasPosition ? position?.upnl : '-'} />
				<LabelledValue label="Position Margin" value={hasPosition ? positionMargin : '-'} />
				<LabelledValue label="Amount" value={position?.quantity} />
				<div className="col-span-2 grid grid-cols-2 xs:col-span-3 w-full">
					<LabelledValue label="Entry Price" value={hasPosition ? formatUSD(position?.entryPrice) : '-'} />
					<LabelledValue label="Liq. Price" value={hasPosition ? formatUSD(position?.liqPrice) : '-'} />
				</div>
			</div>
		</section>
	);
};

const LabelledValue = ({ label, value, className }: { label: string; value: string; className?: string }) => {
	return (
		<div className={cn('flex flex-col items-center gap-1', className)}>
			<p className="leading-none tracking-tight text-[10px] xs:text-xs text-gray-400 mb-0.5 text-center">{label}</p>
			<p className="leading-none tracking-tighter xxs:tracking-normal text-sm xxs:text-base text-right">{value}</p>
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
				'bg-gray-700 rounded-lg flex flex-col items-center justify-center px-2 py-3 min-w-[60px] xxs:min-w-[80px]'
			)}>
			<div className="flex flex-col items-center gap-0.5">
				<Img width={20} height={20} className="rounded-full" src={largeAsset} />
				<p
					data-cy="overview-side"
					className={cn(
						'text-xs xs:text-base',
						hasPosition ? (position.side === 'Bid' ? 'text-green-400' : 'text-red-400') : 'text-gray-100'
					)}>
					{hasPosition ? (position.side === 'Bid' ? ' Long' : ' Short') : '  '}
				</p>
			</div>
			<p className="text-sm xs:text-base">{hasPosition ? `${position.leverage}x` : '-'}</p>
		</div>
	);
};

const longColor = 'rgba(34,62,56,1)';
const shortColor = 'rgba(220, 38, 38, 0.25)';
