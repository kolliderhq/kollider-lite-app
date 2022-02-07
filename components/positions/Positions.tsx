import React, { useEffect } from 'react';

import filter from 'lodash-es/filter';
import map from 'lodash-es/map';
import Img from 'next/image';

import { PositionBox } from 'components/positions/PositionBox';
import { useAppSelector, useSymbols } from 'hooks';

export const PositionOverview = () => {
	const { positions } = useAppSelector(state => state.trading);
	const { symbol } = useSymbols();
	const displayablePositions = filter(positions, position => {
		if (position && Number(position.quantity) >= 1 && position.symbol === symbol) return true;
	});
	return (
		<>
			{displayablePositions.length === 0 ? (
				<div className="w-full h-[200px] flex flex-col items-center justify-center gap-3">
					<Img width={50} height={50} src={'/assets/common/notFound.svg'} />
					<p>No Open Positions</p>
				</div>
			) : (
				map(displayablePositions, position => (
					<PositionBox key={position.symbol} position={position} symbol={position.symbol} />
				))
			)}
		</>
	);
};
