import React, { FormEvent } from 'react';

import cn from 'clsx';

import { baseSocketClient } from 'classes/SocketClient';
import { LeverageArea } from 'components/LeverageArea';
import { SETTINGS } from 'consts';
import { Order, Side, askBidSelector, setOrderQuantity, useOrderbookSelector } from 'contexts';
import { useAppDispatch, useAppSelector, useSymbolPriceDp, useSymbols } from 'hooks';
import { applyDp, formatNumber } from 'utils/format';
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
	const quantity = useAppSelector(state => Number(state.orders.order.quantity));
	const dispatch = useAppDispatch();
	return (
		<div className="h-full w-full">
			<div className="w-full">
				<label className="text-xs text-gray-300 tracking-wider">Quantity</label>
				<div className="bg-gray-700 border-transparent rounded-md w-full">
					<input
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
				<LeverageArea />
			</div>
		</div>
	);
};

const SellButton = ({ bestBid, priceDp }: { bestBid: string; priceDp: number }) => {
	return (
		<button onClick={() => {}} className={cn(buttonClass, 'bg-red-500', { 'opacity-50': !bestBid })}>
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
	return (
		<button
			onClick={() => {}}
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
