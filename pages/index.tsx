import React from 'react';

import { AccountInfo } from 'components/AccountInfo';
import { BalanceInfo } from 'components/BalanceInfo';
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
	const selectedTab = useAppSelector(state => state.layout.selectedTab);
	return (
		<div className="w-full px-2 sm:px-4 pt-4 relative pb-10 min-h-screen">
			<Dialogs />
			<Popups />
			<Header />
			<div className="flex items-center justify-end h-10 w-full mb-4 z-10">
				<div className="w-3/4 xs:w-1/2">
					<SymbolSelectDropdown />
				</div>
			</div>
			<section className="w-full py-3 px-2 xs:py-4 rounded-md border border-gray-600 bg-gray-800 relative z-0">
				{selectedTab === TABS.POSITIONS && (
					<>
						<PositionTable />
						<AccountInfo />
					</>
				)}
				{selectedTab === TABS.ORDER && (
					<>
						<OrderArea />
						<OrderInfo />
					</>
				)}
			</section>
			<BalanceInfo />
		</div>
	);
}
