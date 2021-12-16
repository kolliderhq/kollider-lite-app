import React from 'react';

import cn from 'clsx';

import { baseSocketClient } from 'classes/SocketClient';
import { useAppSelector } from 'hooks';
import { useSafeInterval } from 'hooks/useSafeInterval';

export const Footer = () => {
	return (
		<footer className="fixed bottom-0 left-0 w-full flex items-center justify-between bg-gray-800 h-8 border-t border-gray-600 z-80">
			<div className="flex items-center mx-3 gap-10">
				<SocketStatus />
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
