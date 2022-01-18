import React from 'react';

import useIsWindowVisible from 'hooks/useIsWindowVisible';

export default function useCountdown(targetTimestamp = Date.now() + 10000) {
	const [leftTime, setLeftTime] = React.useState(targetTimestamp - Date.now());
	const visible = useIsWindowVisible();

	React.useEffect(() => {
		if (!visible) return;
		const interval = setInterval(() => {
			if (targetTimestamp - Date.now() > 0) {
				setLeftTime(targetTimestamp - Date.now());
			} else {
				setLeftTime(0);
			}
		}, 1000);
		return () => clearInterval(interval);
	}, [targetTimestamp, visible]);

	return leftTime;
}
