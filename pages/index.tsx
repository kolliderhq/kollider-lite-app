import React from 'react';

import { AccountInfo } from 'components/AccountInfo';
import { BalanceInfo } from 'components/BalanceInfo';
import { Dialogs } from 'components/dialogs/DIalogs';
import { Popups } from 'components/dialogs/Popups';
import { DisplayMarkPrice } from 'components/DisplayMarkPrice';
import { SymbolSelectDropdown } from 'components/Dropdown';
import { Header } from 'components/Header';
import { IndexPriceSparkLine } from 'components/IndexPriceSparkLine';
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
			<div className="grid grid-rows-2 grid-cols-1 xxs:grid-rows-1 xxs:grid-cols-10 xs:grid-cols-2 xxs:h-[50px] w-full mb-4 z-10">
				<div className="order-2 xxs:order-1 col-span-1 xxs:col-span-4 xs:col-span-1 mt-5 xxs:mt-0">
					<DisplayMarkPrice />
				</div>
				<div className="order-1 xxs:order-2 col-span-6 xs:col-span-1 w-full h-10">
					<SymbolSelectDropdown />
				</div>
			</div>
			<SymbolsLoadedWrapper
				loader={
					<div className="h-[150px] w-full">
						<Loader />
					</div>
				}>
				<div className="w-full relative z-5 py-1">
					<IndexPriceSparkLine />
				</div>
			</SymbolsLoadedWrapper>
			<section className="w-full py-3 xs:px-3 px-4 xs:py-4 rounded-md bg-gray-800">
				{selectedTab === TABS.POSITIONS && (
					<>
						<PositionTable />
						<AccountInfo />
					</>
				)}
				{selectedTab === TABS.ORDER && (
					// <div className="flex flex-col">
					<>
						{/*<section className="xs:order-1 order-2">*/}
						<OrderArea />
						{/*</section>*/}
						<section className="mt-3 pb-2 xs:pb-0 xs:order-2 order-1">
							<SymbolsLoadedWrapper>
								<OrderInfo />
							</SymbolsLoadedWrapper>
						</section>
					</>
					// </div>
				)}
			</section>
			<BalanceInfo />
		</div>
	);
}
