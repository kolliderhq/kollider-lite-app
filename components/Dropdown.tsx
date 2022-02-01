import React, { MouseEventHandler, ReactNode } from 'react';

import cn from 'clsx';
import map from 'lodash-es/map';

import { DisplaySymbol } from 'components/DisplaySymbol';
import { setSymbolIndex } from 'contexts';
import { useAppDispatch, useSymbols } from 'hooks';

export function SymbolSelectDropdown() {
	const [isShowing, setIsShowing] = React.useState(false);
	const { symbolsDisplay, symbolsAssets, symbols, symbolIndex } = useSymbols();
	const dispatch = useAppDispatch();
	return (
		<div className="h-16 relative z-10 pointer-events-none">
			<DropdownWrapper
				onClick={() => setIsShowing(v => !v)}
				dataCy="dropdown-symbol-select"
				customClass={cn('bg-gray-900 absolute w-full s-transition-all border-gray-600 border-b rounded-sm', {
					's-dropdown-display s-dropdown-spin-arrow': isShowing,
				})}
			>
				<DropdownSelected customClass="h-16 flex items-center px-3">
					<DisplaySymbol
						asset={symbolsAssets[symbolIndex]}
						symbol={symbols[symbolIndex]}
						value={symbolsDisplay[symbolIndex]}
					/>
				</DropdownSelected>
				{map(symbolsDisplay, (value, i) => {
					return (
						<DropdownItem
							dataCy={`dropdown-symbol-item-${i}`}
							onClick={() => dispatch(setSymbolIndex(i))}
							customClass="h-16 px-3 hidden"
							key={value}
							checked={symbolIndex === i}
						>
							<DisplaySymbol key={symbolsAssets[i]} asset={symbolsAssets[i]} symbol={symbols[i]} value={value} />
						</DropdownItem>
					);
				})}
			</DropdownWrapper>
		</div>
	);
}

export function DropdownWrapper({
	children,
	customClass,
	style,
	dataCy,
	onClick,
}: {
	children: ReactNode;
	customClass?: string;
	style?: React.CSSProperties;
	dataCy?: string;
	onClick?: MouseEventHandler<HTMLElement>;
}) {
	return (
		<div onClick={onClick} data-cy={dataCy} style={style} className={cn('pointer-events-auto z-10', customClass)}>
			{children}
		</div>
	);
}

export function DropdownSelected({
	children,
	customClass,
	arrowClass,
}: {
	children: ReactNode;
	customClass?: string;
	arrowClass?: string;
}) {
	return (
		<div
			style={{ gridTemplateColumns: '1fr 25px' }}
			className={cn('grid px-2 w-full hover:opacity-75 cursor-pointer', customClass)}
		>
			<div className="w-full">{children}</div>
			<div className="flex items-center justify-end">
				<img
					className={cn('s-transition-all s-filter-white', arrowClass ? arrowClass : 'h-5 w-5')}
					src={'/assets/dropdown/arrow.svg'}
					alt={'arr-down'}
				/>
			</div>
		</div>
	);
}

export function DropdownItem({
	children,
	customClass,
	checked,
	onClick,
	dataCy,
}: {
	children: ReactNode;
	customClass?: string;
	checked?: boolean;
	onClick?: MouseEventHandler<HTMLElement>;
	dataCy?: string;
}) {
	return (
		<button
			data-cy={dataCy}
			onClick={onClick}
			className={cn(
				'w-full flex items-center justify-between border border-opacity-0 rounded-sm',
				checked
					? 'border-opacity-100 border-gray-100 border-theme-main'
					: 'border-gray-100 hover:opacity-75 hover:border-opacity-100 cursor-pointer',
				customClass
			)}
		>
			{children}
		</button>
	);
}
