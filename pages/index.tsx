import React from 'react';

import { Dialogs } from 'components/dialogs/DIalogs';
import { Popups } from 'components/dialogs/Popups';
import { SymbolSelectDropdown } from 'components/Dropdown';
import { Header } from 'components/Header';
import { OrderArea } from 'components/OrderArea';
import { OrderInfo } from 'components/OrderInfo';
import { PositionTable } from 'components/Positions';
import { TabSelect } from 'components/TabSelect';
import { TABS } from 'consts';
import { useAppSelector } from 'hooks';

export default function Home() {
	return (
		<div className="w-full px-2 sm:px-4 pt-4 relative pb-20 min-h-screen">
			<Dialogs />
			<Popups />
			<Header />
			<div className="flex items-center justify-end h-10 w-full mb-4 z-10">
				<div className="w-3/4 xs:w-1/2">
					<SymbolSelectDropdown />
				</div>
			</div>
			<OrderWrapper>
				<OrderArea />
				<TabArea />
			</OrderWrapper>
		</div>
	);
}

const TabArea = () => {
	const selectedTab = useAppSelector(state => state.layout.selectedTab);
	return (
		<section className="relative pt-2">
			{selectedTab === TABS.ORDER_INFO && <OrderInfo />}
			{selectedTab === TABS.POSITIONS && <PositionTable />}
		</section>
	);
};

const OrderWrapper = ({ children }) => {
	return (
		<section className="z-0 w-full pt-5 pb-5 px-3 xs:pt-6 xs:pb-6 rounded-md border border-gray-600 bg-gray-800 relative z-0 flex flex-col items-center">
			{/*<div className="absolute left-[10px] top-[6px]">*/}
			{/*	<p className="text-gray-200 text-base tracking-widest">Order</p>*/}
			{/*</div>*/}
			<div className="flex flex-col gap-4 w-full">{children}</div>
		</section>
	);
};
