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
import { formatNumber, roundDecimal, symbolToCurrencySymbol } from 'utils/format';
import { getNumberColour } from 'utils/format';
import { timestampByInterval } from 'utils/scripts';

import Loader from './Loader';

export function MainPriceGauge() {
	const { symbolData, symbol } = useSymbols();

	const markPrice = useMarkPrice(symbol);
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
		if (!data || !priceDp && priceDp !== 0) return;
		if (data?.data?.[0]) {
			setDayAgoPrice(divide(getClosestOpen(data?.data), Math.pow(10, priceDp - 1), priceDp));
		} else setDayAgoPrice(0);
	}, [data, priceDp]);

	const priceInc = React.useMemo(() => {
		if (dayAgoPrice === 0 || isNil(dayAgoPrice)) return NaN;
		let change = divide(minus(markPrice, dayAgoPrice, 7), divide(dayAgoPrice, 100, 7), 2);
		if (change < 0) {
			return Math.ceil(change * 100) / 100;
		} else {
			return Math.floor(change * 100) / 100;
		}
	}, [dayAgoPrice, markPrice]);

	return (
		<div className="w-full flex flex-col gap-2 z-50">
			{markPrice ? (
				<>
					<div className="flex">
						<div className="font-mono">{symbolToCurrencySymbol(symbol)}</div>
						<div className="text-6xl font-mono ml-2">{formatNumber(markPrice)}</div>
					</div>
					<div>
						<span className={cn('text-2xl font-mono tracking-tighter mt-3', getNumberColour(priceInc))}>
							{priceInc < 0 ? priceInc : '+ ' + priceInc} % (24h)
						</span>
					</div>
				</>
			) : (
				<Loader />
			)}
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
