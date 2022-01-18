import React from 'react';

import { AccountInfo } from 'components/AccountInfo';
import { BalanceInfo } from 'components/BalanceInfo';
import { Dialogs } from 'components/dialogs/DIalogs';
import { Popups } from 'components/dialogs/Popups';
import { DisplayMarkPrice } from 'components/DisplayMarkPrice';
import { SymbolSelectDropdown } from 'components/Dropdown';
import { Header } from 'components/Header';
import { IndexPriceSparkLine } from 'components/IndexPriceSparkLine';
import { Leaderboard } from 'components/Leaderboard';
import Loader from 'components/Loader';
import { OrderArea } from 'components/OrderArea';
import { OrderInfo } from 'components/OrderInfo';
import { PositionTable } from 'components/Positions';
import { TabSelect } from 'components/TabSelect';
import { SymbolsLoadedWrapper } from 'components/wrappers/SymbolsLoadedWrapper';
import { TABS } from 'consts';
import { useAppSelector } from 'hooks';

export default function Home() {
	const selectedTab = useAppSelector(state => state.layout.selectedTab);
	return (
		<div className="w-full px-2 sm:px-4 pt-4 relative pb-10 min-h-screen">
			<Dialogs />
			<Popups />
			<Header />
			{selectedTab === TABS.ORDER && (
				<div className="my-1">
					<SymbolSelectDropdown />
				</div>
			)}
			<SymbolsLoadedWrapper
				loader={
					<div className="h-[150px] w-full">
						<Loader />
					</div>
				}>
				{selectedTab === TABS.ORDER && (
					<div className="w-full relative z-5 mb-2">
						<IndexPriceSparkLine />
					</div>
				)}
			</SymbolsLoadedWrapper>
			<section className="w-full mt-2 py-3 xs:px-3 px-4 xs:py-4 rounded-md bg-gray-800">
				{selectedTab === TABS.POSITIONS && <PositionTable />}
				{selectedTab === TABS.ORDER && <OrderArea />}
				{selectedTab === TABS.RANKS && <Leaderboard />}
			</section>
			<BalanceInfo />
		</div>
	);
}
