import React from 'react';

import cn from 'clsx';

import { TABS } from 'consts';
import { setTab } from 'contexts/modules/layout';
import { useAppDispatch, useAppSelector } from 'hooks';

export const TabSelect = () => {
	return (
		<div className="w-full">
			<div className="w-full grid grid-cols-2">
				<TabButton tab={TABS.ORDER} label={'Order'} />
				<TabButton tab={TABS.POSITIONS} label={'Positions'} />
			</div>
		</div>
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
			)}>
			<p
				className={cn(
					'text-xs xs:text-sm',
					tab === selectedTab ? 'text-gray-100' : 'text-gray-400 group-hover:text-gray-100'
				)}>
				{label}
			</p>
		</button>
	);
};
