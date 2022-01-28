import React from 'react';

import cn from 'clsx';
import Img from 'next/image';

import { useAppSelector } from 'hooks';

export const PositionData = ({ symbol }) => {
	const positions = useAppSelector(state => state.trading.positions);
	const position = positions[symbol];

	const hasPosition = position?.quantity ? position.quantity !== '0' : false;
	const largeAsset = React.useMemo(() => {
		if (symbol) return `/assets/coin-logo-large/${symbol.substring(0, 3)}.png`;
		else return `/assets/coin-logo-large/BTC.png`;
	}, [symbol]);
	return (
		<div
			style={{
				background: `linear-gradient(0deg, ${
					hasPosition ? (position.side === 'Bid' ? longColor : shortColor) : 'rgba(38,41,50,1)'
				} 0%,  rgba(38,41,50,1) 100%)`,
			}}
			className={cn(
				'bg-gray-700 rounded-lg flex flex-col items-center justify-center px-2 py-2 xxs:py-3 min-w-[100px] xs:h-20'
			)}
		>
			<div className="flex flex-col items-center gap-0.5">
				<div className="flex items-center gap-1 mb-0.5">
					<Img width={18} height={18} className="rounded-full" src={largeAsset} />
					<p
						data-cy="overview-side"
						className={cn(
							'text-base',
							hasPosition ? (position.side === 'Bid' ? 'text-green-400' : 'text-red-400') : 'text-gray-100'
						)}
					>
						{hasPosition ? (position.side === 'Bid' ? ' Long' : ' Short') : '  '}
					</p>
				</div>
			</div>
			<p className="text-base">{hasPosition ? `${position.leverage}x` : '-'}</p>
		</div>
	);
};

const longColor = 'rgba(34,62,56,1)';
const shortColor = 'rgba(220, 38, 38, 0.25)';
