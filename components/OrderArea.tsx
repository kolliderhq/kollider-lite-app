import React, { FormEvent } from 'react';

import cn from 'clsx';
import toNumber from 'lodash-es/toNumber';

import { baseSocketClient } from 'classes/SocketClient';
import { ChangeLeverageButton, LeverageArea } from 'components/LeverageArea';
import { SETTINGS, TABS } from 'consts';
import { Order, Side, askBidSelector, setOrderLeverage, setOrderQuantity, useOrderbookSelector } from 'contexts';
import { setTab } from 'contexts/modules/layout';
import { useAppDispatch, useAppSelector, useSymbolPriceDp, useSymbols } from 'hooks';
import { applyDp, formatNumber, optionalDecimal } from 'utils/format';
import { isPositiveInteger } from 'utils/scripts';

const buttonClass =
	'h-14 w-full xs:h-full xs:row-span-1 xs:col-span-2 border-2 border-transparent rounded shadow-elevation-08dp flex flex-col justify-center items-center s-transition-all-fast hover:opacity-80';
export const OrderArea = () => {
	const { bestAsk, bestBid } = useOrderbookSelector(askBidSelector);
	const priceDp = useSymbolPriceDp();
	return (
		<section className="w-full flex flex-col items-center xs:grid xs:grid-rows-1 xs:grid-cols-7 h-full xs:h-[160px] w-full gap-4 xs:gap-4">
			<BuyButton className="hidden xs:flex" bestAsk={bestAsk} priceDp={priceDp} />
			<div className="xs:col-span-3 xs:row-span-1 w-full">
				<OrderInput />
			</div>
			<BuyButton className="flex xs:hidden" bestAsk={bestAsk} priceDp={priceDp} />
			<SellButton bestBid={bestBid} priceDp={priceDp} />
		</section>
	);
};

const OrderInput = () => {
	const { symbol } = useSymbols();
	const [quantity, leverage, positions] = useAppSelector(state => [
		Number(state.orders.order.quantity),
		String(state.orders.order.leverage),
		state.trading.positions,
	]);
	const position = positions[symbol];
	const dispatch = useAppDispatch();
	const editingLeverage = useAppSelector(state => state.layout.editingLeverage);

	const hasPositionLeverage = position?.leverage && position?.quantity !== '0';
	React.useEffect(() => {
		if (!hasPositionLeverage) return;
		dispatch(setOrderLeverage(toNumber(position.leverage)));
	}, [hasPositionLeverage, position?.leverage]);

	return (
		<div className="h-full w-full">
			<div className="w-full">
				<label className="text-xs text-gray-300 tracking-wider">Quantity</label>
				<div className="bg-gray-700 border-transparent rounded-md w-full">
					<input
						onFocus={() => dispatch(setTab(TABS.ORDER_INFO))}
						min={1}
						max={SETTINGS.LIMITS.NUMBER}
						step={1}
						onInput={(e: FormEvent<HTMLInputElement>) => {
							if (!isPositiveInteger) return;
							if (Number((e.target as HTMLInputElement).value) > SETTINGS.LIMITS.NUMBER) return;
							dispatch(setOrderQuantity((e.target as HTMLInputElement).value));
						}}
						value={quantity ? quantity : ''}
						type="number"
						placeholder="Quantity"
						className="h-10 xs:h-9 input-default w-full border-transparent border rounded-md focus:border-gray-300 hover:border-gray-300 text-gray-100 bg-gray-700"
					/>
				</div>
			</div>
			<div className="w-full mt-1">
				{!hasPositionLeverage && editingLeverage ? (
					<LeverageArea />
				) : (
					<DisplayLeverage leverage={hasPositionLeverage ? position.leverage : leverage} />
				)}
				{!editingLeverage && <ChangeLeverageButton />}
			</div>
		</div>
	);
};

const DisplayLeverage = ({ leverage }: { leverage: string }) => {
	return (
		<div className="mt-2 h-10 xs:h-9 bg-gray-900 border-transparent border-2 rounded-md w-full relative flex items-center">
			<p className="text-right w-full pr-5">{optionalDecimal(leverage)}</p>
			<p className="text-base text-gray-400 pt-[2px] w-[2%] absolute right-[12px] bottom-[6px] xs:bottom-[4px]">x</p>
		</div>
	);
};

const SellButton = ({ bestBid, priceDp }: { bestBid: string; priceDp: number }) => {
	const { symbol } = useSymbols();
	const order = useAppSelector(state => state.orders.order);
	return (
		<button
			onClick={() => {
				processOrder(order, Side.ASK, priceDp, symbol);
			}}
			className={cn(buttonClass, 'bg-red-500', { 'opacity-50': !bestBid })}>
			<p className="text-sm xs:text-base">
				Sell
				<span className="pr-1" />/<span className="pr-1" />
				Short
			</p>
			<p className="text-sm xs:text-base">{bestBid && <>${formatNumber(applyDp(bestBid, priceDp))}</>}</p>
		</button>
	);
};

const BuyButton = ({ bestAsk, priceDp, className }: { bestAsk: string; priceDp: number; className?: string }) => {
	const { symbol } = useSymbols();
	const order = useAppSelector(state => state.orders.order);
	return (
		<button
			onClick={() => {
				processOrder(order, Side.BID, priceDp, symbol);
			}}
			className={cn(buttonClass, className, 'bg-green-600', {
				'opacity-50': !bestAsk,
			})}>
			<p className="text-sm xs:text-base">
				Buy
				<span className="pr-1" />
				/<span className="pr-1" />
				Long
			</p>
			<p className="text-sm xs:text-base">{bestAsk && <>${formatNumber(applyDp(bestAsk, priceDp))}</>}</p>
		</button>
	);
};

export const processOrder = (order: Order, side: Side, priceDp: number, symbol: string, localSave?: string) => {
	if (order.quantity === 0 || !order.quantity) return;
	const obj = {
		leverage: Number(order.leverage),
		quantity: order.quantity,
		orderType: 'market',
		price: '1',
		isInstant: order.isInstant,
		side: side === Side.BID ? 'Bid' : 'Ask',
		symbol,
		priceDp,
		localSave: localSave,
	};
	if (order.isInstant) obj.localSave = 'instantOrders';
	baseSocketClient.sendOrder(obj);
};
