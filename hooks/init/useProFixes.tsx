// subscribe to data that can exist due to the user originally trading from the pro client

import React from 'react';

import empty from 'is-empty';
import every from 'lodash-es/every';
import filter from 'lodash-es/filter';
import keys from 'lodash-es/keys';
import map from 'lodash-es/map';

import { baseSocketClient } from 'classes/SocketClient';
import { UNUSED_TRADING_TYPES, USER_TYPE } from 'consts';
import { useAppSelector } from 'hooks/redux';
import { TOAST_LEVEL, displayToast } from 'utils/toast';

/**
 * checks for open orders and TPSL. Displays it to the user via a dialog.
 */
export const useProFixes = () => {
	const isUserPro = useAppSelector(state => state.user.data.type === USER_TYPE.PRO);

	React.useEffect(() => {
		if (!isUserPro) return;
		console.log('listen useProFixes');
		const removeListener = baseSocketClient.listenOnce(
			UNUSED_TRADING_TYPES.USER_ADVANCED_ORDERS,
			advancedOrdersListener
		);
		const removeListener2 = baseSocketClient.listenOnce(UNUSED_TRADING_TYPES.OPEN_ORDERS, openOrdersListener);
		return () => {
			removeListener();
			removeListener2();
		};
	}, [isUserPro]);
};

const advancedOrdersListener = data => {
	if (!data) return;
	const orders = data.orders;
	if (empty(orders)) return;
	const symbols = [
		...Array.from(
			new Set(
				map(keys(orders), key => {
					return orders[key]?.symbol;
				})
			)
		),
	];
	displayToast(
		<p className="text-sm">
			You have active TP/SL orders
			<br />
			{map(symbols, v => v.split('.')[0]).join(', ')}
		</p>,
		{
			type: 'error',
			level: TOAST_LEVEL.CRITICAL,
			toastOptions: {
				autoClose: 4000,
			},
		}
	);
};

const openOrdersListener = orders => {
	console.log('OPEN_ORDERS', orders);
	if (empty(orders) || every(keys(orders), key => empty(orders[key]))) return;
	const symbols = keys(orders);
	//	get symbols with open orders
	const filteredSymbols = map(
		filter(
			map(symbols, symbol => orders[symbol]),
			order => !empty(order)
		),
		order => order[Object.keys(order)[0]]?.symbol
	);
	displayToast(
		<p className="text-sm">
			You have open limit orders in
			<br />
			{map(filteredSymbols, v => v.split('.')[0]).join(', ')}
		</p>,
		{
			type: 'error',
			level: TOAST_LEVEL.CRITICAL,
			toastOptions: {
				autoClose: 15000,
			},
		}
	);
};
