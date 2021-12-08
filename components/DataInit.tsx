import React from 'react';

import empty from 'is-empty';
import { useRouter } from 'next/router';

import useAutoLogout from 'hooks/init/useAutoLogout';
import { useCheckIpLocation } from 'hooks/init/useCheckIpLocation';
import useGetMiscData from 'hooks/init/useGetMiscData';
import useQuerySideEffects from 'hooks/init/useQuerySideEffects';
import { useAppSelector } from 'hooks/redux';

export const DataInit = () => {
	const [loaded, setLoaded] = React.useState(false);
	React.useEffect(() => {
		setLoaded(true);
	}, []);

	useGetMiscData();
	//	useStatusChecker();

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
			{afterSymbolLoad}
		</>
	);
};

const RunOnHydration = () => {
	useQuerySideEffects(); //  parse url queries
	useCheckIpLocation();
	return <></>;
};

const RunOnHistoryLoad = () => {
	//	authenticate user
	//	init socket data
	//	automatic refresh JWT
	return <></>;
};

const RunOnSymbolLoad = () => {
	useAutoLogout();
	return <></>;
};
