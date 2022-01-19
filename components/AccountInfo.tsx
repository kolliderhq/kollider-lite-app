import React from 'react';

import { LabelledValue } from 'components/Positions';
import { useAppSelector, useSymbols } from 'hooks';
import { abs, gt } from 'utils/Big';
import { formatNumber, getSatsToDollar } from 'utils/format';
import { getDollarPrefix } from 'utils/scripts';

export const AccountInfo = ({ symbol }) => {
	const positions = useAppSelector(state => state.trading.positions);
	const position = positions[symbol];
	const hasPosition = position && position.quantity !== '0';
	const profit = React.useMemo(() => {
		if (!hasPosition) return '-';
		const dollarValue = getSatsToDollar(position.upnl);
		return (
			<>
				{formatNumber(position.upnl)}
				<span className="pl-1 leading-none tracking-normal text-sm sm:text-base">
					SATS {getDollarPrefix(dollarValue)}
					{gt(0, dollarValue) ? '-' : ''}
					<span className="text-xs sm:text-sm">$</span>
					{formatNumber(abs(dollarValue, 2))}
				</span>
			</>
		);
	}, [hasPosition, position?.upnl]);
	return (
		<div className="flex items-center justify-center">
			<section className="col-span-1 flex items-center justify-center h-full w-full">
				<LabelledValue smallLabel="PNL" actualValue={position?.upnl} coloured label={'Profit Amount'} value={profit} />
			</section>
		</div>
	);
};
