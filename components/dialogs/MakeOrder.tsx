import React from 'react';

import cn from 'clsx';
import toNumber from 'lodash-es/toNumber';
import Img from 'next/image';

import { baseSocketClient } from 'classes/SocketClient';
import { OrderInfo } from 'components/OrderInfo';
import { Order, Side } from 'contexts';
import { setDialogClose } from 'contexts/modules/layout';
import { useAppDispatch, useSymbolData, useSymbols } from 'hooks';
import { fixed, multiply } from 'utils/Big';
import { isNumber } from 'highcharts';

export const MakeOrderDialog = ({ order, side, setIsOpen }: { order: Order; side: Side, setIsOpen: any }) => {
	const dispatch = useAppDispatch();
	const { symbolsAssets, symbolIndex, symbol } = useSymbols();
	const { priceDp, isInversePriced } = useSymbolData();
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
						setIsOpen(false)
						processOrder(order, side, priceDp, symbol, isInversePriced);
					}}>
					<p>Confirm Order</p>
				</button>
			</div>
		</div>
	);
};

export const processOrder = (order: Order, side: Side, priceDp: number, symbol: string, isInversePriced: boolean) => {
	let contractQuantity;
	//	inverse price means dollar == quantity
	if (isInversePriced) {
		contractQuantity = Math.floor(Number(multiply(order.quantity, order.leverage)));
	} else {
		contractQuantity = order.quantity;
	}
	if (contractQuantity < 1) {
		contractQuantity = 1;
	}
	console.log('processOrder', order, contractQuantity, side, priceDp, symbol);
	pureCreateOrder(order, contractQuantity, side, priceDp, symbol);
};

export const pureCreateOrder = (order: Order, quantity: string, side: Side, priceDp: number, symbol: string) => {
	const obj = {
		leverage: order.leverage.toFixed(2),
		quantity: quantity,
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
