import React from 'react';

import includes from 'lodash-es/includes';

import { baseSocketClient } from 'classes/SocketClient';
import { CHANNELS, MESSAGE_TYPES } from 'consts';
import { useAppSelector } from 'hooks/redux';
import useIsWindowVisible from 'hooks/useIsWindowVisible';

const WATCH_TYPES = [CHANNELS.POSITION_STATES, CHANNELS.INDEX_VALUES];
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

				baseSocketClient.requestChannelSubscribe(CHANNELS.POSITION_STATES, []);
			}
			baseSocketClient.socketSend(MESSAGE_TYPES.POSITIONS, {}, null, null);
			baseSocketClient.requestChannelSubscribe(CHANNELS.INDEX_VALUES, []);
		} else {
			baseSocketClient.requestChannelUnsubscribe(CHANNELS.POSITION_STATES, []);
			baseSocketClient.requestChannelUnsubscribe(CHANNELS.INDEX_VALUES, []);
		}
	}, [visible, wsConnected]);
}

const updateChannelData = (msg: any) => {
	// console.log('updateChannelData', msg.type, msg.data);
	//   the one exception due to legacy code
	if (msg?.type === CHANNELS.POSITION_STATES) {
		const symbol = msg?.data?.symbol;
		// console.log('positionStates update', msg);
		if (!symbol) return;
		updateTradingStore({ [symbol]: msg.data }, 'positions');
	} else {
		update(msg, msg?.type);
	}
};

const update = (msg, type) => {
	updateChannelDataStore(
		prevState => {
			return {
				...prevState,
				[msg.data?.symbol]: msg.data,
			};
		},
		type,
		{ callback: true, silent: false }
	);
};
