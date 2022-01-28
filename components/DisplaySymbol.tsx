import React from 'react';

import cn from 'clsx';
import empty from 'is-empty';
import each from 'lodash-es/each';
import isNil from 'lodash-es/isNil';
import Img from 'next/image';
import useSWR from 'swr';

import { DefaultLoader } from 'components/Loader';
import { API_NAMES, TIME } from 'consts';
import { useSymbols } from 'hooks';
import { useMarkPrice } from 'hooks/useMarkPrice';
import { divide, minus } from 'utils/Big';
import { getSWROptions } from 'utils/fetchers';
import { formatNumber, getNumberColour } from 'utils/format';
import { dispSymbol, timestampByInterval } from 'utils/scripts';

export const DisplaySymbol = ({ asset, value, symbol }) => {
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

	const markPrice = useMarkPrice(symbol);
	const priceInc = React.useMemo(() => {
		if (dayAgoPrice === 0 || isNil(dayAgoPrice)) return NaN;
		return divide(minus(markPrice, dayAgoPrice, 7), divide(dayAgoPrice, 100, 7), 2);
	}, [dayAgoPrice, markPrice]);

	return (
		<div className="flex items-center w-full justify-between">
			<div className="flex items-center">
				{!isValidating && markPrice && !isNil(priceInc) ? (
					<p className="flex flex-col items-end px-3">
						<span className="text-xl tracking-tighter font-mono">
							<span className="text-sm pr-1">$</span>
							{formatNumber(markPrice)}
						</span>
						<span className={cn('text-sm font-mono tracking-tighter', getNumberColour(priceInc))}>{priceInc}%</span>
					</p>
				) : (
					<DefaultLoader wrapperClass="ml-10" loaderSize={24} />
				)}
			</div>
			<div className="flex items-center mr-2">
				<figure className="mr-2 flex items-center">
					<Img width={28} height={28} src={asset} />
				</figure>
				<p className="text-base text-gray-100">{dispSymbol(value)}</p>
			</div>
		</div>
	);
};

const getClosestOpen = arr => {
	if (empty(arr)) return 0;
	let ret = 0;
	each(arr, v => {
		if (!v?.open || ret) return;
		ret = v.open;
	});
	return ret;
};
