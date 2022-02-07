import React from 'react';

import { TOOLTIPS } from 'consts/tooltips';

import cn from 'clsx';
import Image from 'next/image';

import { DocumentedElement } from 'components/common/DocumentedElement';

export default function ArrowedHeader({
	value,
	onClick,
	unselect,
	custom,
}: {
	value: string;
	onClick: (value: number) => void;
	unselect: number;
	custom: string;
}) {
	const clickFunc = React.useCallback(() => {
		if (unselect !== 2) onClick(2);
		else onClick(1);
	}, [unselect, onClick]);
	return React.useMemo(
		() => (
			<div className={cn('h-full flex items-center cursor-pointer select-none', custom)} onClick={clickFunc}>
				{TOOLTIPS[value] ? (
					<DocumentedElement
						clickLink={TOOLTIPS[value].link}
						tooltipId={value}
						tooltipContents={TOOLTIPS[value].tooltip}>
						<p className="mr-2 text-xs leading-1">{value}</p>
					</DocumentedElement>
				) : (
					<p className="mr-2 text-xs leading-1">{value}</p>
				)}

				<div className="flex flex-col justify-around">
					<Image
						width={8}
						height={8}
						src={'/assets/common/table-header-arrow.svg'}
						className={cn('mb-0.5', { 's-filter-white': unselect === 2 })}
						alt={'arr'}
					/>
					<Image
						width={8}
						height={8}
						src={'/assets/common/table-header-arrow.svg'}
						className={cn('s-flip', { 's-filter-white': unselect === 1 })}
						alt={'arr'}
					/>
				</div>
			</div>
		),
		[value, unselect, clickFunc, custom]
	);
}
