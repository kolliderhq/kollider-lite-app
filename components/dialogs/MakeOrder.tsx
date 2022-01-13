import React from 'react';

import cn from 'clsx';
import Img from 'next/image';

import { baseSocketClient } from 'classes/SocketClient';
import { OrderInfo } from 'components/OrderInfo';
import { Order, Side } from 'contexts';
import { setDialogClose } from 'contexts/modules/layout';
import { useAppDispatch, useSymbolData, useSymbols } from 'hooks';

export const MakeOrderDialog = ({ order, side }: { order: Order; side: Side }) => {
	const dispatch = useAppDispatch();
	const { symbolsAssets, symbolIndex, symbol } = useSymbols();
	const { priceDp } = useSymbolData();

	return (
		<div className="w-full h-full mt-5">
			<div className="flex items-center w-full justify-center gap-2">
				<Img width={32} height={32} src={symbolsAssets[symbolIndex]} />
				<h2 className={cn('text-center text-2xl xs:text-3xl leading-none')}>
					<span className="leading-none pr-3">{side === Side.ASK ? 'Sell' : 'Buy'}</span>Order
				</h2>
			</div>
			<div className="p-4">
				<OrderInfo side={side} />
				<button
					className={cn(
						'mt-5 border rounded-lg border-transparent w-full px-4 py-3 flex items-center justify-center bg-theme-main'
					)}
					onClick={() => {
						dispatch(setDialogClose());
						processOrder(order, side, priceDp, symbol);
					}}>
					<p>Confirm {side === Side.ASK ? 'Sell' : 'Buy'}</p>
				</button>
			</div>
		</div>
	);
};

export const processOrder = (order: Order, side: Side, priceDp: number, symbol: string) => {
	const obj = {
		leverage: Number(order.leverage),
		quantity: order.quantity,
		orderType: 'market',
		price: '1',
		isInstant: order.isInstant,
		side: side === Side.BID ? 'Bid' : 'Ask',
		symbol,
		priceDp,
		localSave: 'instantOrders',
	};
	baseSocketClient.sendOrder(obj);
};