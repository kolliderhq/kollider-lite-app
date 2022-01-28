import React from 'react';

import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import cloneDeep from 'lodash-es/cloneDeep';

import { GENERAL, UI } from 'consts';
import { reduxStore } from 'contexts';
import { multiply } from 'utils/Big';
import { formatNumber, getTime } from 'utils/format';
import { FixedLengthArray } from 'utils/types/utils';

interface SparkChartOptions {
	width: number;
	height: number;
	margin: FixedLengthArray<[number, number, number, number]>;
}

export const SparkLine = ({
	options = GENERAL.DEFAULT.OBJ,
	series,
	yAxis = GENERAL.DEFAULT.OBJ,
	xAxis = GENERAL.DEFAULT.OBJ,
}: {
	options?: SparkChartOptions | Highcharts.ChartOptions;
	series: Highcharts.SeriesOptions;
	yAxis?: Highcharts.YAxisOptions;
	xAxis?: Highcharts.XAxisOptions;
}) => {
	const [chartOptions, setChartOptions] = React.useState(cloneDeep(defaultOptions));
	React.useEffect(() => {
		console.log('setChartOptions >>> ', series);
		// @ts-ignore
		setChartOptions(prevValue => {
			return cloneDeep({
				...prevValue,
				...options,
				series: series,
				yAxis: [
					{
						...defaultYAxis,
						...yAxis,
					},
				],
				xAxis: [
					{
						...defaultXAxis,
						...xAxis,
					},
				],
			});
		});
	}, [series, xAxis, yAxis, options]);
	return <HighchartsReact highcharts={Highcharts} options={chartOptions} />;
};

const getSatsToDollar = num => {
	const btcDollar = reduxStore.getState().prices.indexes['BTCUSD.PERP'];
	return multiply(num, multiply(UI.DENOM.BTC.MULT, btcDollar, 10), 2);
};

const defaultXAxis = {
	visible: false,
	// labels: {
	// 	overflow: 'allow',
	// 	align: 'center',
	// 	formatter: function formatFunc() {
	// 		const value = formatHour(this.value);
	// 		if (this.axis.tickInterval >= 86400000) {
	// 			return formatDay(this.value);
	// 		}
	// 		const split = value.split(' ');
	// 		return `${split[1] ? `${split[1]}<br />` : ''}${split[0]}`;
	// 	},
	// 	maxStaggerLines: 2,
	// },
	// minPadding: 0,
	// maxPadding: 0,
	// gridLineColor: 'rgba(255,255,255, 0.2)',
	// tickPosition: 'outside',
	// tickColor: 'transparent',
	// tickInterval: TIME.HOUR * 5,
};
const defaultYAxis = {
	// type: 'logarithmic',
	// allowDecimals: false,
	// minorTicks: false,
	// tickInterval: 0.5,
	visible: false,
	// opposite: true,
	// endOnTick: true,
	// gridLineColor: 'rgba(255,255,255, 0.2)',
	// labels: {
	// 	enabled: true,
	// 	align: 'left',
	// 	x: 14,
	// 	style: {
	// 		color: '#4b525d',
	// 		fontSize: '11px',
	// 	},
	// },
	// title: {
	// 	text: '',
	// },
};

const defaultOptions = {
	chart: {
		backgroundColor: null,
		borderWidth: 0,
		type: 'area',
		margin: [2, 0, 2, 0],
		height: 120,
		style: {
			overflow: 'allow',
		},
		skipClone: true,
	},
	title: {
		text: '',
	},
	credits: {
		enabled: false,
	},
	xAxis: {
		labels: {
			enabled: false,
		},
		title: {
			text: null,
		},
		startOnTick: false,
		endOnTick: false,
		tickPositions: [],
	},
	yAxis: {
		endOnTick: false,
		startOnTick: false,
		labels: {
			enabled: false,
		},
		title: {
			text: null,
		},
		tickPositions: [0],
	},
	legend: {
		enabled: false,
	},
	tooltip: {
		hideDelay: 0,
		enabled: true,
		stickOnContact: false,
		snap: 10,
		backgroundColor: '#262932',
		borderColor: null,
		borderRadius: 10,
		borderWidth: 1,
		headerShape: 'callout',
		shadow: true,
		formatter: function () {
			return `<div className='leading-none'>
			<p style='font-size: 12px; color: #bbbebf; line-height: 1;'>
				$${formatNumber(Math.floor(this.y), 3)}
				<br />
			</p>
			<p style='font-size: 10px; color: #fff'>
				${getTime(this.x)}
			</p>
			</div>
			`;
		},
		useHTML: true,
	},
	plotOptions: {
		series: {
			animation: false,
			lineWidth: 1,
			shadow: false,
			states: {
				hover: {
					lineWidth: 1,
				},
			},
			marker: {
				radius: 0,
				states: {
					hover: {
						radius: 2,
					},
				},
			},
			fillOpacity: 0.25,
		},
		column: {
			negativeColor: '#910000',
			borderColor: 'silver',
		},
	},
};
