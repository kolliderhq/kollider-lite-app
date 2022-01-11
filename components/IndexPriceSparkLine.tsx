import React from 'react';

import useSWR from 'swr';

import { SparkLine } from 'components/charts/SparkLine';
import Loader from 'components/Loader';
import { API_NAMES, TIME } from 'consts';
import { useSymbols } from 'hooks';
import { getSWROptions } from 'utils/fetchers';
import { timestampByInterval } from 'utils/scripts';

export const IndexPriceSparkLine = () => {
	const { symbol } = useSymbols();
	const [indexSymbol, setIndexSymbol] = React.useState('');
	React.useEffect(() => {
		if (!symbol) return;
		setIndexSymbol('.' + symbol.split('.')[0]);
	}, [symbol]);
	const { data } = useSWR(
		indexSymbol ? [API_NAMES.HISTORICAL_INDEX_PRICES, indexSymbol, '1h', 168] : null,
		getSWROptions(API_NAMES.HISTORICAL_INDEX_PRICES)
	);
	const [series, setSeries] = React.useState<any>();
	const [yAxis, setYAxis] = React.useState({});

	React.useEffect(() => {
		if (!data) return;
		setSeries(generateSeries(data.data));
		const [min, max] = getMinMax(data.data);
		setYAxis({ min, max });
		console.log('IndexPriceSparkLine', data);
	}, [data]);

	return <SparkLine series={series} yAxis={yAxis} />;
};

const generateSeries = data => {
	if (data?.length === 0) return null;
	return [
		{
			// type: 'areaspline',
			type: 'area',
			color: '#7372f7',
			fillColor: {
				linearGradient: {
					x1: 0,
					y1: 0,
					x2: 0,
					y2: 1,
				},
				stops: [
					[0, 'rgba(115, 114, 247, 0.6)'],
					[0.5, 'rgba(115, 114, 247, 0.3)'],
					[1, 'rgba(115, 114, 247, 0.1)'],
				],
			},
			data,
		},
	];
};

const getMinMax = arr => {
	const valueArr = arr.map(item => item[1]);
	return [Math.min(...valueArr) * 0.99, Math.max(...valueArr) * 1.01];
};
