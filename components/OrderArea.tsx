import React, { FormEvent } from 'react';

import cn from 'clsx';

import { LeverageArea } from 'components/LeverageArea';
import { SETTINGS } from 'consts';
import { askBidSelector, setOrderQuantity, useOrderbookSelector } from 'contexts';
import { useAppDispatch, useAppSelector, useSymbolPriceDp, useSymbols } from 'hooks';
import { applyDp, formatNumber } from 'utils/format';
import { isPositiveInteger } from 'utils/scripts';

const buttonClass =
	'h-16 w-full xs:h-full xs:row-span-1 xs:col-span-2 border-2 border-transparent rounded shadow-elevation-08dp flex flex-col justify-center items-center s-transition-all-fast hover:opacity-80';
export const OrderArea = () => {
	const { bestAsk, bestBid } = useOrderbookSelector(askBidSelector);
	const priceDp = useSymbolPriceDp();
	return (
		<section className="w-full pt-8 pb-5 px-3 xs:pt-12 xs:pb-6 rounded-md border border-gray-600 bg-gray-800 relative flex flex-col items-center">
			<div className="absolute left-[10px] top-[6px]">
				<p className="text-gray-200 text-base tracking-widest">Order</p>
			</div>
			<section className="w-full flex flex-col items-center xs:grid xs:grid-rows-1 xs:grid-cols-7 h-full xs:h-[160px] w-full gap-4 xs:gap-4">
				<BuyButton className="hidden xs:flex" bestAsk={bestAsk} priceDp={priceDp} />
				<div className="xs:col-span-3 xs:row-span-1 w-full">
					<OrderInput />
				</div>
				<BuyButton className="flex xs:hidden" bestAsk={bestAsk} priceDp={priceDp} />
				<button onClick={() => {}} className={cn(buttonClass, 'bg-red-500', { 'opacity-50': !bestBid })}>
					<p>
						Sell
						<span className="pr-1" />/<span className="pr-1" />
						Short
					</p>
					<p>{bestBid && <>${formatNumber(applyDp(bestBid, priceDp))}</>}</p>
				</button>
			</section>
		</section>
	);
};

const BuyButton = ({ bestAsk, priceDp, className }: { bestAsk: string; priceDp: number; className?: string }) => {
	return (
		<button
			onClick={() => {}}
			className={cn(buttonClass, className, 'bg-green-600', {
				'opacity-50': !bestAsk,
			})}>
			<p>
				Buy
				<span className="pr-1" />
				/<span className="pr-1" />
				Long
			</p>
			<p>{bestAsk && <>${formatNumber(applyDp(bestAsk, priceDp))}</>}</p>
		</button>
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
