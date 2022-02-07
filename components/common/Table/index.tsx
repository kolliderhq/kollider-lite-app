import React, { Dispatch, ReactNode, SetStateAction } from 'react';

import { TOOLTIPS } from 'consts/tooltips';

import cn from 'clsx';
import map from 'lodash-es/map';

import ArrowedHeader from 'components/common/ArrowedHeader';
import { DocumentedElement } from 'components/common/DocumentedElement';

export function TableHeader({
	widthArr,
	valueClass,
	values,
	customClassArr,
	wrapperClass,
	arrowedArr = [],
	sort,
	setSort,
}: {
	widthArr: string[];
	valueClass?: string;
	values: string[];
	customClassArr?: string[];
	wrapperClass?: string;
	arrowedArr?: string[];
	sort?: [string, number];
	setSort?: Dispatch<SetStateAction<[string, number]>>;
}) {
	return (
		<ul className={cn('w-full flex', wrapperClass)}>
			{map(values, (v, i) => {
				return (
					<li
						key={i}
						className={cn('py-1 h-8 truncate font-mono text-gray-300', i < values?.length - 1 ? 'pl-1' : 'pr-1')}
						style={{ width: widthArr[i] }}>
						<div className={customClassArr[i]}>
							{arrowedArr[i] ? (
								<ArrowedHeader
									custom={'justify-end'}
									value={v}
									unselect={sort[0] !== arrowedArr[i] ? 0 : sort[1]}
									onClick={n => setSort([arrowedArr[i], n])}
								/>
							) : TOOLTIPS[v] ? (
								<DocumentedElement
									clickLink={TOOLTIPS[v].link}
									tooltipId={v}
									tooltipContents={TOOLTIPS[v].tooltip}
									styles={false}>
									<p className={cn('leading-none w-fit', valueClass ? valueClass : 'text-xs')}>{v}</p>
								</DocumentedElement>
							) : (
								<p className={cn('leading-none w-fit', valueClass ? valueClass : 'text-xs')}>{v}</p>
							)}
						</div>
					</li>
				);
			})}
		</ul>
	);
}

export function TableWrapper({
	children,
	height,
	className,
}: {
	children: ReactNode;
	height?: number;
	className?: string;
}) {
	return (
		<div
			style={height ? { maxHeight: `${height}px`, minHeight: `${height}px` } : {}}
			className={cn('overflow-y-auto overflow-x-hidden s-hide-scrollbar py-1', className)}>
			{children}
		</div>
	);
}
