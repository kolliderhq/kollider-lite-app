import React from 'react';

import cn from 'clsx';
import empty from 'is-empty';
import { divide, isNil } from 'lodash-es';
import each from 'lodash-es/each';
import useSWR from 'swr';

import { API_NAMES, TIME } from 'consts';
import { useSymbols } from 'hooks';
import { useMarkPrice } from 'hooks/useMarkPrice';
import { minus } from 'utils/Big';
import { getSWROptions } from 'utils/fetchers';
import { formatNumber, roundDecimal } from 'utils/format';
import { getNumberColour } from 'utils/format';
import { timestampByInterval } from 'utils/scripts';

export function MainPriceGauge() {
	const markPrice = useMarkPrice('BTCUSD.PERP');
	let symbol = 'BTCUSD.PERP';

	const { symbolData } = useSymbols();
	const priceDp = symbolData?.[symbol]?.priceDp;
	const [dayAgoPrice, setDayAgoPrice] = React.useState(null);
	const dayAgo = [
		timestampByInterval(Date.now() - TIME.HOUR * 24, TIME.HOUR),
		timestampByInterval(Date.now() - TIME.HOUR * 18, TIME.HOUR),
	];
	const { data, isValidating } = useSWR(
		[API_NAMES.HISTORICAL_OHLC, symbol, '1h', dayAgo[0], dayAgo[1]],
		getSWROptions(API_NAMES.HISTORICAL_OHLC)
	);
	React.useEffect(() => {
		if (!data || !priceDp) return;
		if (data?.data?.[0]) {
			setDayAgoPrice(divide(getClosestOpen(data?.data), Math.pow(10, priceDp - 1), priceDp));
		} else setDayAgoPrice(0);
	}, [data, priceDp]);

	const priceInc = React.useMemo(() => {
		if (dayAgoPrice === 0 || isNil(dayAgoPrice)) return NaN;
		return divide(minus(markPrice, dayAgoPrice, 7), divide(dayAgoPrice, 100, 7), 2);
	}, [dayAgoPrice, markPrice]);

	return (
		<div className="w-full flex flex-col gap-2">
			<div className="flex">
				<div className="font-mono">$</div>
				<div className="text-6xl font-mono ml-2">{formatNumber(markPrice)}</div>
			</div>
			<div>
				<span className={cn('text-2xl font-mono tracking-tighter mt-3', getNumberColour(priceInc))}>
					{priceInc < 0? "- " : "+ "  + roundDecimal(priceInc, 2)} % (24h)
				</span>
			</div>
		</div>
	);
}

const getClosestOpen = arr => {
	if (empty(arr)) return 0;
	let ret = 0;
	each(arr, v => {
		if (!v?.open || ret) return;
		ret = v.open;
	});
	return ret;
};
