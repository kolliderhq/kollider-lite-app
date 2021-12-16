import React from 'react';

import empty from 'is-empty';
import { useRouter } from 'next/router';

import { USER_TYPES } from 'consts/user';
import useAutoLogout from 'hooks/init/useAutoLogout';
import { useCheckIpLocation } from 'hooks/init/useCheckIpLocation';
import useGetMiscData from 'hooks/init/useGetMiscData';
import { useGetOrderbookData } from 'hooks/init/useGetOrderbookData';
import { useInitialize } from 'hooks/init/useInitialize';
import useQuerySideEffects from 'hooks/init/useQuerySideEffects';
import { useSocketData } from 'hooks/init/useSocketData';
import { useAppSelector } from 'hooks/redux';
import { useStatusChecker } from 'hooks/useStatusChecker';

export const DataInit = () => {
	const [loaded, setLoaded] = React.useState(false);
	React.useEffect(() => {
		setLoaded(true);
	}, []);

	useGetMiscData();
	useStatusChecker();

	const afterhydration = React.useMemo(() => {
		if (!loaded) return;
		return <RunOnHydration />;
	}, [loaded]);

	const history = useRouter();
	const afterHistoryLoad = React.useMemo(() => {
		if (!history.isReady) return;
		return <RunOnHistoryLoad />;
	}, [history.isReady]);

	const symbolData = useAppSelector(state => state.symbols.symbolData);
	const afterSymbolLoad = React.useMemo(() => {
		if (empty(symbolData)) return;
		return <RunOnSymbolLoad />;
	}, [symbolData]);

	return (
		<>
			{afterhydration}
			{afterHistoryLoad}
			{afterSymbolLoad}
		</>
	);
};

const RunOnHydration = () => {
	useQuerySideEffects(); //  parse url queries
	useSocketData();
	useCheckIpLocation();
	return <></>;
};

const RunOnHistoryLoad = () => {
	useInitialize(); //	authenticate user -> done before loading screen

	return <></>;
};

const RunOnSymbolLoad = () => {
	//	trading listener

	useAutoLogout();
	useGetOrderbookData(); //	init socket data
	//	useWebln
	return <></>;
};
