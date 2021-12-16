import React from 'react';

import useIsWindowVisible from 'hooks/useIsWindowVisible';

// automatically stops interval if window is unfocused
// subscribable
type NoArgsCallback = () => void;
export const useSafeInterval = (ms: number) => {
	const ref = React.useRef<NoArgsCallback[]>([]);
	const visible = useIsWindowVisible();

	React.useEffect(() => {
		if (!visible) return;
		const interval = setInterval(() => {
			ref.current.forEach(callback => {
				callback();
			});
		}, ms);
		return () => {
			clearInterval(interval);
		};
	}, [visible]);

	const subscribe = React.useCallback((cb: NoArgsCallback) => {
		ref.current.push(cb);
		return ref.current.length - 1;
	}, []) as (cb: NoArgsCallback) => number;

	const unsubscribe = React.useCallback((cbIndex: number) => {
		if (ref.current.length - 1 <= cbIndex && cbIndex >= 0) return ref.current.splice(cbIndex, 1);
		else throw new Error(`Invalid callback index ${cbIndex}`);
	}, []) as (cbIndex: number) => [NoArgsCallback];
	return React.useMemo(() => ({ subscribe, unsubscribe }), []);
};
