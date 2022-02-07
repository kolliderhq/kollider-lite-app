import React from 'react';
import PropTypes from 'prop-types';

import { MISC } from 'constants/misc';

import cn from 'clsx';

import { matchesFlashCount, proxyLastMatches } from 'contexts/custom/lastMatches';
import { divide, fixed } from 'utils/Big';
import { formatNumber, get24hrTime } from 'utils/format';

const rowHeight = 20;
export const TradesRow = ({ priceDp, tableWidths, colClassArr, index, symbol }) => {
	const data = proxyLastMatches[symbol]?.[index];
	const [flash, setFlash] = React.useState(false);
	React.useEffect(() => {
		if (MISC.LIMITS.TRADE_TABLE_MAX - index - 1 < matchesFlashCount[symbol]) setFlash(true);
	}, [data]);

	React.useEffect(() => {
		if (!flash) return;
		const timeout = setTimeout(() => setFlash(false), MISC.FLASH.TIMEOUT);
		return () => clearTimeout(timeout);
	}, [flash]);
	const style = data ? { height: `${rowHeight}px` } : hideStyle;
	if (flash && data) {
		style.background = data?.takerSide === 'Bid' ? 'rgba(6, 95, 70, 0.5)' : 'rgba(153, 27, 27, 0.5)';
	}
	return (
		<ul
			style={style}
			className={cn('flex items-center font-mono', data?.takerSide === 'Bid' ? 'text-green-400' : 'text-red-400', {
				hidden: !data,
			})}>
			{data ? (
				<>
					<li style={{ width: tableWidths[0] }} className={cn('w-full')}>
						<div className={colClassArr[0]}>
							<svg
								className={cn(
									data?.takerSide === 'Bid' ? 's-filter-green-400 h-4 w-4' : 's-filter-red-400 h-4 w-4',
									data?.priceDiff < 0 ? 's-flip' : ''
								)}
								width="16"
								height="16"
								viewBox="0 0 16 16">
								{data?.priceDiff !== 0 ? (
									<g id="up_gr" transform="translate(-532 -553)">
										<path
											d="M-1.414-1.414,6.6-.763-.763,6.6Z"
											transform="translate(540 559.2) rotate(45)"
											fill="#000000"
										/>
									</g>
								) : (
									<line strokeWidth="2" stroke="#000" id="svg_1" y2="8" x2="12" y1="8" x1="4" fill="#000" />
								)}
							</svg>
							<p className="text-xs">
								{formatNumber(divide(data?.price, Math.pow(10, priceDp ? priceDp : 2), priceDp ? priceDp : 2))}
							</p>
						</div>
					</li>
					<li style={{ width: tableWidths[1] }} className={cn('pl-1 w-full')}>
						<div className={colClassArr[1]}>
							<p className="text-xs">{formatNumber(fixed(data?.quantity, 0))}</p>
						</div>
					</li>
					<li style={{ width: tableWidths[2] }} className={cn('pl-1 w-full')}>
						<div className={colClassArr[2]}>
							<p className="text-xs">{get24hrTime(data?.time)}</p>
						</div>
					</li>
				</>
			) : undefined}
		</ul>
	);
};
TradesRow.propTypes = {
	data: PropTypes.object,
	tableWidths: PropTypes.arrayOf(PropTypes.string).isRequired,
	colClassArr: PropTypes.arrayOf(PropTypes.string).isRequired,
	rowHeight: PropTypes.number,
};

const hideStyle = { maxHeight: '0px', overflow: 'hidden' };
