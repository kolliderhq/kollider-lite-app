import React from 'react';

import cn from 'clsx';
import empty from 'is-empty';
import { Position } from 'postcss';

import { TABS } from 'consts';
import { setTab } from 'contexts/modules/layout';
import { useAppDispatch, useAppSelector, useSymbols } from 'hooks';

export const TabSelect = () => {
	return (
		<div className="w-full">
			<div className="w-full grid grid-cols-3">
				<TabButton tab={TABS.ORDER} label={'Order'} />
				<PositionsTabButton />
				<TabButton tab={TABS.RANKS} label={'Competition'} />
			</div>
		</div>
	);
};

const PositionsTabButton = () => {
	const changeRef = React.useRef<Record<string, number>>();
	const [changed, setChanged] = React.useState(false);
	const { symbol } = useSymbols();
	const [selectedTab, positionChange] = useAppSelector(state => [
		state.layout.selectedTab,
		state.trading.positionChange,
	]);

	//	load after 3 seconds
	React.useEffect(() => {
		setTimeout(() => {
			changeRef.current = { ...positionChange };
		}, 3000);
	}, []);

	//	update changed boolean to true if value was updated
	React.useEffect(() => {
		if (empty(changeRef.current) || selectedTab === TABS.POSITIONS) return;
		if (positionChange[symbol] !== changeRef.current[symbol]) setChanged(true);
	}, [positionChange, symbol]);

	//	set changed to false by default on change of symbol
	React.useEffect(() => {
		setChanged(false);
	}, [symbol]);

	const dispatch = useAppDispatch();

	return (
		<button
			onClick={() => {
				dispatch(setTab(TABS.POSITIONS));
				setChanged(false);
			}}
			className={cn(
				TABS.POSITIONS === selectedTab
					? 'border-theme-main bg-gray-700'
					: 'border-gray-400 hover:border-theme-main bg-gray-900',
				'border-t-2 flex items-center justify-center py-2 xs:py-3 group relative'
			)}
		>
			<p
				className={cn(
					'text-xs xs:text-sm',
					TABS.POSITIONS === selectedTab ? 'text-gray-100' : 'text-gray-400 group-hover:text-gray-100'
				)}
			>
				Positions
			</p>
			<div
				style={{ transform: 'translate3d(0, -50%, 0)' }}
				className="absolute left-[calc(50%+40px)] xs:left-[calc(50%+45px)] top-[50%]"
			>
				{changed && <div className="s-pulse w-1 h-1 rounded-full bg-red-600" />}
			</div>
		</button>
	);
};

const TabButton = ({ tab, label }: { tab: TABS; label: string }) => {
	const selectedTab = useAppSelector(state => state.layout.selectedTab);
	const dispatch = useAppDispatch();
	return (
		<button
			onClick={() => dispatch(setTab(tab))}
			className={cn(
				tab === selectedTab ? 'border-theme-main bg-gray-700' : 'border-gray-400 hover:border-theme-main bg-gray-900',
				'border-t-2 flex items-center justify-center py-2 xs:py-3 group'
			)}
		>
			<p
				className={cn(
					'text-xs xs:text-sm',
					tab === selectedTab ? 'text-gray-100' : 'text-gray-400 group-hover:text-gray-100'
				)}
			>
				{label}
			</p>
		</button>
	);
};
