import React from 'react';

import cn from 'clsx';

import { baseSocketClient } from 'classes/SocketClient';
import { TabSelect } from 'components/TabSelect';
import { useAppSelector } from 'hooks';
import { useSafeInterval } from 'hooks/useSafeInterval';

export const Footer = () => {
	return (
		<footer className="fixed bottom-0 left-0 w-full">
			<div className="w-full flex items-center z-80">
				<TabSelect />
			</div>
			<div className="w-full flex items-center bg-gray-800 h-8 border-t border-gray-600 z-80">
				<div className="max-w-sm min-w-xxxs mx-auto w-full flex items-center gap-5 sm:gap-10 px-5 sm:px-8">
					<SocketStatus />
					{process.env.NEXT_PUBLIC_UMBREL === '1' ? <UmbrelStatus /> : <WeblnStatus />}
				</div>
			</div>
		</footer>
	);
};

const SocketStatus = () => {
	const [, updateState] = React.useState(true);
	const forceUpdate = React.useCallback(() => updateState(v => !v), []);
	const online = useAppSelector(state => state.connection.isOnline);
	const ticker = useSafeInterval(1000);
	React.useEffect(() => {
		if (process.env.NEXT_PUBLIC_UMBREL === '1' && window.location.hostname !== "umbrel.local") {
			alert("Kollider Lite only supports being loaded from umbrel.local:4243")
		}
	}, [])
	React.useEffect(() => {
		const cbIndex = ticker.subscribe(() => {
			forceUpdate();
		});
		return () => {
			ticker.unsubscribe(cbIndex);
		};
	}, []);

	const [status, setStatus] = React.useState('bg-red-500');
	React.useEffect(() => {
		if (online && baseSocketClient.isReady) setStatus('bg-green-500');
		else setStatus('bg-red-500');
	}, [online, baseSocketClient.isReady]);

	return (
		<div className="h-full flex items-center">
			<div className={cn('h-2 w-2 rounded-full mr-1', status)} />
			<p className="text-xs leading-none">status</p>
		</div>
	);
};

const WeblnStatus = () => {
	const isWeblnConnected = useAppSelector(state => state.connection.isWeblnConnected);
	const [, updateState] = React.useState(true);
	const forceUpdate = React.useCallback(() => updateState(v => !v), []);
	const ticker = useSafeInterval(5000);
	React.useEffect(() => {
		const cbIndex = ticker.subscribe(() => {
			forceUpdate();
		});
		return () => {
			ticker.unsubscribe(cbIndex);
		};
	}, []);

	const [status, setStatus] = React.useState('bg-red-500');
	React.useEffect(() => {
		if (isWeblnConnected) setStatus('bg-green-500');
		else setStatus('bg-red-500');
	}, [isWeblnConnected]);

	return (
		<div className="h-full flex items-center">
			<div className={cn('h-2 w-2 rounded-full mr-1', status)} />
			<p className="text-xs leading-none">Webln</p>
		</div>
	);
};

const UmbrelStatus = () => {
	const isUmbrelAvailable  = useAppSelector(state => state.connection.isUmbrelConnected);
	console.log(isUmbrelAvailable)
	return (
		<div className="h-full flex items-center">
			<div className={cn('h-2 w-2 rounded-full mr-1', isUmbrelAvailable ? 'bg-green-500' : 'bg-red-500')} />
			<p className="text-xs leading-none">Umbrel</p>
		</div>
	);
};
