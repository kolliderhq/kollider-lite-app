import React, { SetStateAction } from 'react';

import noop from 'lodash-es/noop';

import { FixedLengthArray } from 'utils/types/utils';

export default function useTimer(initSec = 60000, endFunc = noop) {
	const [time, setTime] = React.useState<number>(initSec);
	const ref = React.useRef({ endFunc });
	React.useEffect(() => {
		const interval = setInterval(() => {
			setTime(v => {
				if (v < 0) {
					return v;
				}
				if (v <= 500) {
					ref.current.endFunc();
				}
				return v - 1000;
			});
		}, 1000);
		return () => clearInterval(interval);
	}, []);
	return [time, setTime] as FixedLengthArray<[number, React.Dispatch<SetStateAction<number>>]>;
}
