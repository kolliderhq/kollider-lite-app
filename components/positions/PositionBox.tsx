import React from 'react';

import cn from 'clsx';

import { AccountInfo } from 'components/AccountInfo';
import { pureCreateOrder } from 'components/dialogs/MakeOrder';
import { LabelledValue } from 'components/LabelledValue';
import { PositionData } from 'components/positions/PositionData';
import { Order, Side } from 'contexts';
import { useAppSelector } from 'hooks';
import { useMarkPrice } from 'hooks/useMarkPrice';
import { fixed } from 'utils/Big';
import { formatNumber, formatUSD, getSatsToDollar, limitNumber } from 'utils/format';
import { isNumber } from 'utils/scripts';

export const PositionBox = ({ symbol, position }) => {
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
