import React, { ReactNode } from 'react';

import cn from 'clsx';
import filter from 'lodash-es/filter';
import map from 'lodash-es/map';
import Img from 'next/image';

import { AccountInfo } from 'components/AccountInfo';
import { pureCreateOrder } from 'components/dialogs/MakeOrder';
import { useMarkPrice } from 'components/DisplaySymbol';
import { Order, Side, askBidSelector, useOrderbookSelector } from 'contexts';
import { useAppSelector, useSymbolData, useSymbols } from 'hooks';
import { fixed } from 'utils/Big';
import { formatNumber, formatUSD, getSatsToDollar, limitNumber, optionalDecimal } from 'utils/format';
import { isNumber } from 'utils/scripts';

export const PositionTable = () => {
	const { positions } = useAppSelector(state => state.trading);
	const displayablePositions = filter(positions, position => {
		if (position && Number(position.quantity) >= 1) return true;
	});
	console.log(displayablePositions);
	return (
		<>
			{displayablePositions.length === 0 ? (
				<div className="w-full h-[200px] flex flex-col items-center justify-center gap-3">
					<Img width={50} height={50} src={'/assets/common/notFound.svg'} />
					<p>Not Found</p>
				</div>
			) : (
				map(displayablePositions, position => (
					<PositionBox key={position.symbol} position={position} symbol={position.symbol} />
				))
			)}
		</>
	);
};

const PositionBox = ({ symbol, position }) => {
	const { balances } = useAppSelector(state => state.trading);

	const positionMargin = React.useMemo(() => {
		if (!isNumber(balances?.isolatedMargin?.[symbol])) return '0';
		return fixed(balances?.isolatedMargin?.[symbol], 0);
	}, [balances?.isolatedMargin, symbol]);

	const hasPosition = position?.quantity ? position.quantity !== '0' : false;
	const investedAmount = React.useMemo(() => {
		if (!hasPosition) return '-';
		return (
			<>
				{positionMargin ? formatNumber(positionMargin) : '-'}
				<span className="pl-1 leading-none tracking-normal text-sm sm:text-base">
					SATS ≈<span className="text-xs sm:text-sm">$</span>
					{positionMargin ? formatNumber(getSatsToDollar(positionMargin)) : '-'}
				</span>
			</>
		);
	}, [hasPosition, positionMargin]);
	return (
		<section className="grid grid-rows-[fit-content(100%),1fr] xxs:grid-rows-1 grid-cols-1 xxs:grid-cols-3 gap-1 first:pt-0 pt-2 pb-2 border-b last:pb-0 last:border-b-0 border-gray-600">
			<div className="py-2 xxs:py-0 xxs:col-span-1 w-full h-full">
				<div className="grid grid-cols-2 grid-rows-2 grid-flow-col xxs:flex flex-col items-center justify-center h-full xxs:gap-y-2 gap-x-3">
					<div className="order-2 xxs:order-1 pb-1 xxs:pb-0">
						<MarkPriceDisplay symbol={symbol} />
					</div>
					<div className="order-1 xxs:order-2 row-span-2">
						<PositionData symbol={symbol} />
					</div>
					<div className="order-3 xxs:order-3 w-full flex items-center justify-center">
						<ClosePosition symbol={symbol} />
					</div>
				</div>
			</div>
			<div className="col-span-2 grid grid-cols-2 xs:grid-cols-2 grid-rows-3 gap-x-1 xxs:gap-x-2 gap-y-2 w-full xs:px-5 sm:px-0">
				<div className="col-span-2">
					<LabelledValue smallLabel="Margin" label="Invested Amount" value={investedAmount} />
				</div>
				<LabelledValue
					smallLabel="Entry Price"
					label="Purchase Price"
					value={hasPosition ? formatUSD(position?.entryPrice) : '-'}
				/>
				<LabelledValue
					smallLabel="Liquidation Price"
					label="Liq. Price"
					value={hasPosition ? formatUSD(limitNumber(position?.liqPrice)) : '-'}
				/>
				<div className="col-span-2">
					<AccountInfo symbol={symbol} />
				</div>
			</div>
		</section>
	);
};

const MarkPriceDisplay = ({ symbol }) => {
	const markPrice = useMarkPrice(symbol);

	return (
		<div className="w-full flex items-center justify-center">
			<p className="text-lg">
				<span className="text-xs pr-0.5">$</span>
				{formatNumber(markPrice)}
			</p>
		</div>
	);
};

const ClosePosition = ({ symbol }) => {
	const symbolData = useAppSelector(state => state.symbols.symbolData);
	const { priceDp, isInversePriced, contractSize } = symbolData[symbol];
	const positions = useAppSelector(state => state.trading.positions);
	const position = positions[symbol];
	const hasPosition = position?.quantity ? position.quantity !== '0' : false;
	const onClosePosition = React.useCallback(() => {
		if (!hasPosition) return;
		const order = {
			quantity: position.quantity,
			leverage: Number(position.leverage),
			isInstant: true,
		} as Order;
		pureCreateOrder(order, order.quantity, position.side === 'Ask' ? Side.BID : Side.ASK, priceDp, symbol);
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

export const LabelledValue = ({
	smallLabel,
	label,
	value,
	className,
	coloured,
	actualValue,
}: {
	smallLabel?: string;
	label: string;
	value: string | ReactNode;
	className?: string;
	coloured?: boolean;
	actualValue?: string; //	for colouring the value according to the actual value
}) => {
	return (
		<div className={cn('flex flex-col items-center justify-center h-[50px] xxs:h-15', className)}>
			<p className="text-[8px] leading-none text-gray-600 mb-0.5 sm:mb-0">{smallLabel}</p>
			<p className="leading-none tracking-tight text-xs sm:text-sm text-gray-400 text-center mb-1 sm:mb-0.5">{label}</p>
			<p
				className={cn(
					coloured &&
						value !== '-' &&
						(Number(actualValue ? actualValue : value) < 0 ? 'text-red-400' : 'text-green-400'),
					'leading-none tracking-normal text-base sm:leading-none sm:text-lg text-right'
				)}
			>
				{value}
			</p>
		</div>
	);
};

const PositionData = ({ symbol }) => {
	const positions = useAppSelector(state => state.trading.positions);
	const position = positions[symbol];

	const hasPosition = position?.quantity ? position.quantity !== '0' : false;
	const largeAsset = React.useMemo(() => {
		if (symbol) return `/assets/coin-logo-large/${symbol.substring(0, 3)}.png`;
		else return `/assets/coin-logo-large/BTC.png`;
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
