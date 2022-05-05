import React, { useEffect, useMemo, useState } from 'react';

import cn from 'clsx';
import toNumber from 'lodash-es/toNumber';
import Img from 'next/image';

import { baseSocketClient } from 'classes/SocketClient';
import { Side } from 'contexts';
import { setDialogClose } from 'contexts/modules/layout';
import { useAppDispatch, useAppSelector, useSymbolData, useSymbols } from 'hooks';
import { fixed, multiply } from 'utils/Big';
import { applyDp, roundDecimal, symbolToCurrencySymbol } from 'utils/format';
import { useMarkPrice } from 'hooks/useMarkPrice';

export const EditTpslDialog = ({ position, isOpen }) => {
	const dispatch = useAppDispatch();
	const { symbolsAssets, symbolIndex, symbol, symbolsAssetsMap } = useSymbols();
	const { priceDp, isInversePriced } = useSymbolData(position.symbol?position.symbol: null);
	const markPrice = useMarkPrice(position.symbol)
	const [tpp, setTpp] = useState(null);
	const [slp, setSlp] = useState(null);
	const [advancedOrders] = useAppSelector(state => [state.trading.advancedOrders]);
	const [existingTp, setExistingTp] = useState(null);
	const [existingSl, setExistingSl] = useState(null);

	useEffect(() => {
		let { tp, sl } = findRelevantAO(advancedOrders, position.symbol);
		if (tp) {
			setExistingTp(tp);
			setTpp(applyDp(tp.price, priceDp))
		}
		if (sl) {
			setExistingSl(sl);
			setSlp(applyDp(sl.price, priceDp))
		}
	}, [advancedOrders, position]);

	const onTpChange = value => {
		setTpp(value);
	};

	const onSlChange = value => {
		setSlp(value);
	};

	const takeProfitInput = () => {
		return (
			<>
				<div className="text-green-500"> Take Profit</div>
				<input
					onInput={e => onTpChange(e.target.value)}
					className="mt-2 input-default bg-gray-700 inline-block w-full rounded-md border border-transparent focus:border-gray-300 hover:border-gray-300"
					value={tpp ? tpp : ''}
					type="number"
					placeholder="Take Profit"></input>
			</>
		);
	};

	const stopLossInput = () => {
		return (
			<>
				<div className="text-red-500"> Stop Loss</div>
				<input
					onInput={e => onSlChange(e.target.value)}
					className="mt-2 input-default bg-gray-700 inline-block w-full rounded-md border border-transparent focus:border-gray-300 hover:border-gray-300"
					value={slp ? slp : ''}
					type="number"
					placeholder="Stop Loss"></input>
			</>
		);
	};

	return (
		<div className="my-auto w-full h-full mt-5">
			<div className="flex items-center w-full justify-center gap-2">
				<Img width={64} height={32} src={symbolsAssetsMap[position.symbol? position.symbol: 'BTCUSD.PERP']} />
				<h2 className={cn('text-center text-2xl xs:text-3xl leading-none')}>Edit TPSL</h2>
			</div>
			<div className="p-4">
				<div>{position.side === 'Bid' ? takeProfitInput() : stopLossInput()}</div>
				<div className="my-4 text-center w-full text-xl">Current Price: {symbolToCurrencySymbol(position.symbol)}{markPrice}</div>
				<div>{position.side === 'Bid' ? stopLossInput() : takeProfitInput()}</div>
				<button
					className={cn(
						'mt-5 border rounded-lg border-transparent w-full px-4 py-3 flex items-center justify-center bg-theme-main'
					)}
					onClick={() => {
						// dispatch(setDialogClose());
						if (tpp) {
							if ((existingTp && tpp !== applyDp(existingTp.price, priceDp)) || !existingTp) {
								let side = position.side === 'Bid' ? 'Ask' : 'Bid';
								pureCreateTPSLOrder(
									tpp,
									position.leverage,
									position.quantity,
									side,
									priceDp,
									position.symbol,
									'TakeProfit',
									'MarkPrice'
								);
								isOpen(false);
							}
							isOpen(false);
						}
						if (!tpp && existingTp) {
							pureCancelTPSL(existingTp.orderId)
							isOpen(false);
						}
						if (slp) {
							if ((existingSl && slp !== applyDp(existingSl.price, priceDp)) || !existingSl) {
								let side = position.side === 'Bid' ? 'Ask' : 'Bid';
								pureCreateTPSLOrder(
									slp,
									position.leverage,
									position.quantity,
									side,
									priceDp,
									position.symbol,
									'StopLoss',
									'MarkPrice'
								);
								isOpen(false);
							}
							isOpen(false);
						}
						if (!slp  && existingSl) {
							pureCancelTPSL(existingSl.orderId)
							isOpen(false);
						}
					}}>
					<p>Add TPSL</p>
				</button>
			</div>
		</div>
	);
};

export const processOrder = (order, side, priceDp, symbol, isInversePriced) => {
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

export const pureCreateTPSLOrder = (
	price,
	leverage,
	quantity,
	side,
	priceDp,
	symbol,
	advancedOrderType,
	triggerPriceType
) => {
	const obj = {
		leverage: toNumber(`${fixed(leverage, 1)}`),
		quantity: quantity,
		orderType: 'market',
		price: price,
		isInstant: true,
		side: side === Side.BID ? 'Bid' : 'Ask',
		symbol,
		priceDp,
		advancedOrderType,
		triggerPriceType,
		localSave: 'instantOrders',
	};
	baseSocketClient.sendAdvancedOrder(obj);
};

export const pureCancelTPSL = (orderId) => {
	const obj = {
		orderId: orderId,
	}
	baseSocketClient.cancelAdvancedOrder(obj);
}

const findRelevantAO = (advancedOrders, symbol) => {
	let tp = null;
	let sl = null;
	Object.entries(advancedOrders).map(([key, i]) => {
		let order = advancedOrders[key];
		if (order.symbol === symbol) {
			if (order.advancedOrderType === 'TakeProfit') {
				tp = order;
			}
			if (order.advancedOrderType === 'StopLoss') {
				sl = order;
			}
		}
	});
	return { tp, sl };
};
