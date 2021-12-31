import React from 'react';

import { OrderbookClient } from 'classes/OrderbookClient';
import { baseSocketClient } from 'classes/SocketClient';
import { CHANNELS } from 'consts';
import { useAppSelector } from 'hooks/redux';
import useIsWindowVisible from 'hooks/useIsWindowVisible';
import { useSymbols } from 'hooks/useSymbols';

export const useGetOrderbookData = () => {
	const ref = React.useRef<InstanceType<typeof OrderbookClient>>();
	const visible = useIsWindowVisible();
	const [wsReady, wsAuthenticated] = useAppSelector(state => [
		state.connection.isWsConnected,
		state.connection.isWsAuthenticated,
	]);
	const { symbol } = useSymbols();

	React.useLayoutEffect(() => {
		if (ref.current || !wsReady) return;
		ref.current = new OrderbookClient(!!wsReady, symbol);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [wsReady]);

	//	on socket state change
	React.useEffect(() => {
		if (!ref.current) return;
		if (wsReady && !ref.current.isWsConnected) ref.current.onSocketConnect();
		else if (!wsReady && ref.current.isWsConnected) ref.current.onSocketDisconnect();
	}, [wsReady, ref.current?.isWsConnected]);

	/**
	 * Resub to orderbook channel on authentication to fix below issue
	 * https://layertwolabs.slack.com/archives/C01HYLHF2Q4/p1640929915004900
	 */
	React.useEffect(() => {
		if (!wsReady) return;
		if (!visible) return;
		if (wsAuthenticated) {
			baseSocketClient.requestChannelSubscribe(CHANNELS.ORDERBOOK_LEVEL2, [ref.current.currentSymbol]);
		}
	}, [wsReady, visible, wsAuthenticated]);

	React.useEffect(() => {
		if (!ref.current) return;
		ref.current.symbolChange(symbol);
	}, [symbol]);
};
