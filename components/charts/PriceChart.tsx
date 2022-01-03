import React from 'react';

import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import cloneDeep from 'lodash-es/cloneDeep';

import { GENERAL, TIME, UI } from 'consts';
import { reduxStore } from 'contexts';
import { multiply } from 'utils/Big';
import { formatNumber, getTime } from 'utils/format';
import { formatDay, formatHour } from 'utils/time';
import { FixedLengthArray } from 'utils/types/utils';

interface PriceChartOptions {
	width: number;
	height: number;
	margin: FixedLengthArray<[number, number, number, number]>;
}

export const PriceChart = ({
	options = GENERAL.DEFAULT.OBJ,
	events = GENERAL.DEFAULT.OBJ,
	series,
	yAxis = GENERAL.DEFAULT.OBJ,
	xAxis = GENERAL.DEFAULT.OBJ,
}: {
	options: PriceChartOptions | Highcharts.ChartOptions;
	events: Highcharts.ChartEventsOptions;
	series: Highcharts.SeriesOptions;
	yAxis: Highcharts.YAxisOptions;
	xAxis: Highcharts.XAxisOptions;
}) => {
	const [chartOptions, setChartOptions] = React.useState(cloneDeep(defaultOptions));
	React.useEffect(() => {
		setChartOptions(v => {
			return {
				...v,
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
			};
		});
	}, [series, xAxis, yAxis, events, options]);
	return <HighchartsReact highcharts={Highcharts} options={chartOptions} />;
};

const getSatsToDollar = num => {
	const btcDollar = reduxStore.getState().prices.indexes['BTCUSD.PERP'];
	return multiply(num, multiply(UI.DENOM.BTC.MULT, btcDollar, 10), 2);
};

const defaultXAxis = {
	labels: {
		overflow: 'allow',
		align: 'center',
		formatter: function formatFunc() {
			const value = formatHour(this.value);
			if (this.axis.tickInterval >= 86400000) {
				return formatDay(this.value);
			}
			const split = value.split(' ');
			return `${split[1] ? `${split[1]}<br />` : ''}${split[0]}`;
		},
		maxStaggerLines: 2,
	},
	minPadding: 0,
	maxPadding: 0,
	gridLineColor: 'rgba(255,255,255, 0.2)',
	tickPosition: 'outside',
	tickColor: 'transparent',
	tickInterval: TIME.HOUR * 5,
};
const defaultYAxis = {
	type: 'logarithmic',
	allowDecimals: false,
	minorTicks: false,
	tickInterval: 0.5,
	visible: true,
	opposite: true,
	endOnTick: true,
	gridLineColor: 'rgba(255,255,255, 0.2)',
	labels: {
		enabled: true,
		align: 'left',
		x: 14,
		style: {
			color: '#4b525d',
			fontSize: '11px',
		},
	},
	title: {
		text: '',
	},
};

const defaultOptions = {
	boost: {
		useGPUTranslations: true,
		seriesThreshold: 5,
	},
	credits: {
		enabled: false,
	},
	title: {
		text: '',
	},
	legend: {
		enabled: false,
	},
	chart: {
		zoomtype: 'x',
		type: 'areaspline',
		margin: [20, 70, 40, 10],
		height: 250,
		width: 800,
	},
	plotOptions: {
		series: {
			states: {
				hover: {
					enabled: true,
					lineWidthPlus: 0,
					halo: {
						size: 0,
						opacity: 0,
					},
				},
				select: {
					enabled: false,
				},
			},
			plotOptions: {
				series: {
					states: {
						hover: {
							enabled: true,
							lineWidthPlus: 0,
							halo: {
								size: 0,
								opacity: 0,
							},
						},
						select: {
							enabled: false,
						},
					},
					allowPointSelect: false,
					marker: {
						enabled: false,
					},
				},
			},
			allowPointSelect: false,
			marker: {
				enabled: false,
			},
		},
	},
	tooltip: {
		enabled: true,
		stickOnContact: false,
		snap: 50,
		backgroundColor: '#262932',
		borderColor: null,
		borderRadius: 10,
		borderWidth: 1,
		headerShape: 'callout',
		shadow: true,
		formatter: function () {
			return `<div>
			<p style='font-size: 15px; color: ${this.color};'>${this.series.name}</p>
			<p style='font-size: 15px; color: #bbbebf; line-height: 1.2;'>
				${formatNumber(Math.floor(this.y), 3)} <span style='font-size: 13px'>SATS</span>
				<br />
				<span style='font-size: 11px;'>≈ $${formatNumber(getSatsToDollar(this.y))}</span>
			</p>
			<p style='font-size: 12px; color: #fff'>
				${getTime(this.x)}
			</p>
			</div>
			`;
		},
		useHTML: true,
	},
};
