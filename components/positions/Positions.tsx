import React from 'react';

import filter from 'lodash-es/filter';
import map from 'lodash-es/map';
import Img from 'next/image';

import { PositionBox } from 'components/positions/PositionBox';
import { useAppSelector } from 'hooks';

export const PositionTable = () => {
	const { positions } = useAppSelector(state => state.trading);
	const displayablePositions = filter(positions, position => {
		if (position && Number(position.quantity) >= 1) return true;
	});
	console.log(displayablePositions);
	return (
		<>
			{displayablePositions.length === 0 ? (
				<div className="w-full h-[200px] flex flex-col items-center justify-center gap-3">
					<Img width={50} height={50} src={'/assets/common/notFound.svg'} />
					<p>Not Found</p>
				</div>
			) : (
				map(displayablePositions, position => (
					<PositionBox key={position.symbol} position={position} symbol={position.symbol} />
				))
			)}
		</>
	);
};
