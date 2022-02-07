import React, { useEffect, useState } from 'react';

import { BalanceInfo } from 'components/BalanceInfo';
import { Dialogs } from 'components/dialogs/DIalogs';
import { Popups } from 'components/dialogs/Popups';
import { SymbolSelectDropdown } from 'components/Dropdown';
import { IndexPriceSparkLine } from 'components/graphs/IndexPriceSparkLine';
import { Header } from 'components/layout/Header';
import { Leaderboard } from 'components/Leaderboard';
import Loader from 'components/Loader';
import { MainPriceGauge } from 'components/MainPriceGauge';
import { OrderArea } from 'components/OrderArea';
import { PositionOverview } from 'components/positions/Positions';
import { TradingViewTables } from 'components/positions/PositionsTable';
import { TransactionProcessingInfo } from 'components/TransactionProcessInfo';
import { SymbolsLoadedWrapper } from 'components/wrappers/SymbolsLoadedWrapper';
import { TABS } from 'consts';
import { useAppSelector } from 'hooks';

import { UserInfo } from '../components/UserInfo';

export default function Home() {
	const [selectedTab, paymentInTransit] = useAppSelector(state => [
		state.layout.selectedTab,
		state.payments.paymentInTransit,
	]);
	return (
		<div className="w-full sm:grid sm:grid-rows px-2 sm:px-4 pt-3 relative pb-10 min-h-screen">
			<Dialogs />
			<Popups />

			<Header />
			<div className="hidden sm:block">
				<div className="grid grid-cols-4 gap-4 pl-12 pr-12">
					{selectedTab === TABS.ORDER && (
						<>
							<div className="flex xs:col-span-2 xl:col-span-1">
								<div className="mx-auto mt-14">
									<div className="my-1 w-80">
										<SymbolSelectDropdown />
									</div>
									<section className="px-4 xs:py-4 xs:px-3 rounded-md bg-gray-800 w-80">
										<OrderArea />
									</section>
								</div>
							</div>
							<div className="hidden sm:block xs:col-span-2 xl:col-span-3">
								<SymbolsLoadedWrapper
									loader={
										<div className="h-[150px] w-full">
											<Loader />
										</div>
									}>
									<div className="grid grid-rows-2 relative">
										<div className="w-full">
											<div className="text-xl h-12">
												<MainPriceGauge />
											</div>
											<IndexPriceSparkLine height={400} />
										</div>
										<div className="flex">
											<div className="mx-auto w-full">
												<TradingViewTables/>
											</div>
										</div>
									</div>
								</SymbolsLoadedWrapper>
							</div>
						</>
					)}

					<section className="hidden sm:block flex col-span-4">
						<div className="m-auto w-1/2">{selectedTab === TABS.RANKS && <Leaderboard />}</div>
					</section>
				</div>

				<div className="pb-10 sm:fixed sm:w-full sm:bottom-0 sm:left-0">
					<div className="sm:ml-2 sm:mr-2">
						<BalanceInfo />
						<UserInfo />
					</div>
				</div>
			</div>
			<div className="sm:hidden">
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
							<IndexPriceSparkLine height={200}/>
						</div>
					)}
				</SymbolsLoadedWrapper>
				<section className="w-full mt-2 py-3 xs:px-3 px-4 xs:py-4 rounded-md bg-gray-800">
					{selectedTab === TABS.POSITIONS && <PositionOverview />}
					{selectedTab === TABS.ORDER && <OrderArea />}
					{selectedTab === TABS.RANKS && <Leaderboard />}
				</section>
				<div className="pb-10">
					<BalanceInfo />
					<UserInfo />
				</div>
			</div>
			<div className="">{paymentInTransit && <TransactionProcessingInfo />}</div>
		</div>
	);
}
