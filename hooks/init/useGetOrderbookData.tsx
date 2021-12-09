import React from 'react';

import { OrderbookClient } from 'classes/OrderbookClient';
import { useAppSelector } from 'hooks/redux';
import { useSymbols } from 'hooks/useSymbols';

export const useGetOrderbookData = () => {
	const ref = React.useRef<InstanceType<typeof OrderbookClient>>();
	const wsReady = useAppSelector(state => state.connection.isWsConnected);
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

	React.useEffect(() => {
		if (!ref.current) return;
		ref.current.symbolChange(symbol);
	}, [symbol]);
};
