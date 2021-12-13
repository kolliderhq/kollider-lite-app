import React from 'react';

import includes from 'lodash-es/includes';

import { baseSocketClient } from 'classes/SocketClient';
import { CHANNELS, MESSAGE_TYPES } from 'consts';
import { setBalances, setPositionsData, storeDispatch } from 'contexts';
import { setIndexes } from 'contexts/modules/prices';
import { useAppSelector } from 'hooks/redux';
import useIsWindowVisible from 'hooks/useIsWindowVisible';

const WATCH_TYPES = [CHANNELS.POSITION_STATES, CHANNELS.INDEX_VALUES, CHANNELS.MARK_PRICE];
export function useSocketData() {
	const [wsConnected, wsAuthenticated] = useAppSelector(state => [
		state.connection.isWsConnected,
		state.connection.isWsAuthenticated,
	]);
	const visible = useIsWindowVisible();

	React.useEffect(() => {
		const channelListener = msg => {
			if (!includes(WATCH_TYPES, msg?.type)) return;
			updateChannelData(msg);
		};
		baseSocketClient.addEventListener(channelListener);
	}, []);

	React.useEffect(() => {
		if (!wsConnected) return;
		if (visible) {
			if (wsAuthenticated) {
				baseSocketClient.socketSend(MESSAGE_TYPES.WITHDRAWAL_LIMIT_INFO, {}, null, null);
				baseSocketClient.socketSend(MESSAGE_TYPES.POSITIONS, {}, null, null);

				baseSocketClient.requestChannelSubscribe(CHANNELS.POSITION_STATES, []);
			}
			baseSocketClient.requestChannelSubscribe(CHANNELS.MARK_PRICE, []);
			baseSocketClient.requestChannelSubscribe(CHANNELS.INDEX_VALUES, []);
		} else {
			if (wsAuthenticated) {
				baseSocketClient.requestChannelUnsubscribe(CHANNELS.POSITION_STATES, []);
			}
			baseSocketClient.requestChannelUnsubscribe(CHANNELS.MARK_PRICE, []);
			baseSocketClient.requestChannelUnsubscribe(CHANNELS.INDEX_VALUES, []);
		}
	}, [visible, wsConnected]);
}

const updateChannelData = (msg: any) => {
	// console.log('updateChannelData', msg.type, msg.data);
	//   the one exception due to legacy code
	if (msg?.type === CHANNELS.MARK_PRICE) {
		const symbol = msg.data?.symbol;
		if (!symbol) return;
		storeDispatch();
	} else if (msg?.type === CHANNELS.POSITION_STATES) {
		const symbol = msg?.data?.symbol;
		// console.log('positionStates update', msg);
		if (!symbol) return;
		storeDispatch(setPositionsData({ symbol, data: msg.data }));
	} else if (msg?.type === CHANNELS.INDEX_VALUES) {
		if (!msg.data?.symbol) return;
		storeDispatch(setIndexes({ symbol: msg.data.symbol, value: msg.data.value }));
	} else if (msg?.type === CHANNELS.BALANCES) {
		if (!msg.data?.cash) return;
		storeDispatch(setBalances(msg.data));
	} else {
		console.error(`unknown type - ${msg.type}`);
		console.log(msg.data);
	}
};
