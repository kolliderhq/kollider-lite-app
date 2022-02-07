import * as React from 'react';

import cn from 'clsx';
import compact from 'lodash-es/compact';
import filter from 'lodash-es/filter';
import findIndex from 'lodash-es/findIndex';
import map from 'lodash-es/map';
import times from 'lodash-es/times';
import useSWR from 'swr';

import Img from 'components/common/Img';
import { DisplayAmount, DisplayNumber } from 'components/common/Numbers';
import { SmallTableLabel } from 'components/common/SmallTable';
import { TableHeader, TableWrapper } from 'components/common/Table';
import { WrapBaseDialog } from 'components/dialogs';
import { DialogWrapper } from 'components/dialogs/DIalogs';
import { EditTpslDialog } from 'components/dialogs/EditTpsl';
import { pureCreateOrder } from 'components/dialogs/MakeOrder';
import { DisplaySymbol } from 'components/DisplaySymbol';
import { TableTabs } from 'components/positions/TableTabs';
import { API, TABLE_TABS } from 'consts';
import { API_NAMES } from 'consts';
import { DIALOGS } from 'consts';
import { TABLES } from 'consts/layout';
import { Side } from 'contexts';
import { useAppDispatch, useAppSelector } from 'hooks';
import { useSymbols } from 'hooks';
import { useMarkPrice } from 'hooks/useMarkPrice';
import { CloseSvg } from 'public/assets/common/close.svg';
import { fixed, gte } from 'utils/Big';
import { fetcher, getSWROptions } from 'utils/fetchers';
import { applyDp, roundDecimal } from 'utils/format';
import { mapKeyValues, timestampByInterval } from 'utils/scripts';
import { isNumber } from 'utils/scripts';

import { PositionOverview } from './Positions';

const HEADER_TABLE_DATA = {
	label: 'Positions',
	header: ['Symbol', 'Amount', 'Margin', 'Entry Price', 'Mark / Liq. Price', 'Leverage', 'PNL', 'Actions'],
	widths: ['10%', '10%', '15%', '12.5%', '22.5%', '10%', '20%', '10%'],
	RowComponent: null,
};
const TABLE_DATA = TABLES[1];
TABLE_DATA.widths = HEADER_TABLE_DATA.widths;
const numberClass = 'flex items-center justify-end';

export const TradingViewTables = () => {
	const [selectedTableTab] = useAppSelector(state => [state.layout.selectedTableTab]);
	return (
		<>
			<div className="mb-5 w-full mt-2 z-0">
				<section className="hidden xl:block w-full p-5 rounded-2xl bg-gray-900 shadow-container">
					<TableTabs />
					<div className="h-48 overflow-auto">
						{selectedTableTab === TABLE_TABS.POSITIONS && <PositionsTable />}
						{selectedTableTab === TABLE_TABS.TRADES && <TradesTable />}
					</div>
				</section>
				<section className="xl:hidden w-full p-5 rounded-2xl bg-gray-900 shadow-container">
					<PositionOverview />
				</section>
			</div>
		</>
	);
};

const TradesTable = () => {
	return (
		<table className="table-fixed w-full z-0">
			<thead className="sticky top-0 bg-gray-900 border-b border-gray-600">
				<tr className="w-full">
					<th className="w-12 font-thin">Symbol</th>
					<th className="font-thin">Side</th>
					<th className="font-thin">Quantity</th>
					<th className="font-thin">
						Price <span className="text-xs font-thin"></span>
					</th>
					<th className="font-thin">Leverage</th>
					<th className="font-thin">Order Type</th>
					<th className="font-thin">
						RPNL <span className="text-xs font-thin">(Sats)</span>
					</th>
					<th className="">
						Fees <span className="text-xs font-thin">(Sats)</span>
					</th>
				</tr>
			</thead>
			<tbody className="divide-y divide-gray-600">
				<TradesTableRows />
			</tbody>
		</table>
	);
};

const TradesTableRows = () => {
	let end = Date.now();
	let limit = 100;

	const symbolData = useAppSelector(state => state.symbols.symbolData);
	const [apiKey] = useAppSelector(state => [state.connection.apiKey]);
	const { symbolsAssetsMap } = useSymbols();

	const { data, isValidating } = useSWR(
		apiKey !== '' ? [API_NAMES.HISTORICAL_TRADES] : undefined,
		getSWROptions(API_NAMES.HISTORICAL_TRADES)
	);
	// console.log(data?.map(v => {console.log(v)}))
	const trades = data
		? data.map(trade => {
				const { priceDp } = symbolData[trade.symbol];
				return (
					<tr className="h-12" key={trade.orderId}>
						<td>
							<figure className="mr-2 flex items-center h-full">
								<div className="m-auto">
									<img style={{ with: 23, height: 23 }} src={symbolsAssetsMap[trade.symbol]} />
								</div>
							</figure>
						</td>
						<td className="text-center">{trade.side === 'Bid' ? 'Buy' : 'Sell'}</td>
						<td className="text-center">{trade.quantity}</td>
						<td className="text-center">{roundDecimal(trade.price, priceDp)}</td>
						<td className="text-center">{trade.leverage}</td>
						<td className="text-center">{trade.orderType}</td>
						<td className="text-center">{roundDecimal(trade.rpnl, priceDp)}</td>
						<td className="text-center">{roundDecimal(trade.fees, priceDp)}</td>
					</tr>
				);
		  })
		: [];
	return trades;
};

const PositionsTable = () => {
	const [selectedPosition, setSelectedPosition] = React.useState(null);
	const [showEditTpsl, setShowEditTpsl] = React.useState(false);

	return (
		<div>
			<WrapBaseDialog dialogType={DIALOGS.EDIT_TPSL} isOpen={showEditTpsl} close={() => setShowEditTpsl(false)}>
				<EditTpslDialog position={selectedPosition} isOpen={setShowEditTpsl} />
			</WrapBaseDialog>
			<table className="table-fixed w-full">
				<thead>
					<tr className="border-b border-gray-600 w-full">
						<th className="w-20 text-left font-thin">Symbol</th>
						<th className="w-12 font-thin">Side</th>
						<th className="font-thin">Qty</th>
						<th className="font-thin">Entry Price</th>
						<th className="font-thin">TP/SL</th>
						<th className="font-thin">Liq. Price</th>
						<th className="font-thin">Leverage</th>
						<th className="font-thin">PnL</th>
						<th className="font-thin">Action</th>
					</tr>
				</thead>
				<tbody className="">
					<PositionTableRows setSelectedPosition={setSelectedPosition} setShowEditTpsl={setShowEditTpsl} />
				</tbody>
			</table>
		</div>
	);
};

const PositionTableRows = ({ setSelectedPosition, setShowEditTpsl }) => {
	const symbolData = useAppSelector(state => state.symbols.symbolData);
	const [positions, advancedOrders] = useAppSelector(state => [state.trading.positions, state.trading.advancedOrders]);

	const [aO, setAO] = React.useState({});

	React.useEffect(() => {
		setAO(advancedOrders);
	}, [advancedOrders]);

	const onClosePosition = (position, priceDp) => {
		const order = {
			quantity: position.quantity,
			leverage: Number(position.leverage),
			isInstant: true,
		};
		pureCreateOrder(order, order.quantity, position.side === 'Ask' ? Side.BID : Side.ASK, priceDp, position.symbol);
	};

	const { symbolsDisplay, symbolsAssets, symbolsAssetsMap } = useSymbols();

	const onEditTpsl = p => {
		setSelectedPosition(p);
		setShowEditTpsl(true);
	};

	let pos = Object.keys(positions).map((sym, pos) => {
		const p = positions[sym];
		const hasPosition = p?.quantity ? p.quantity !== '0' : false;
		const { priceDp } = symbolData[sym];

		const { tp, sl } = findRelevantAO(aO, sym);
		let tpPrice = tp ? applyDp(tp.price, priceDp).toString() : '-';
		let slPrice = sl ? applyDp(sl.price, priceDp).toString() : '-';

		if (!hasPosition) {
			return;
		}
		return (
			<tr className="h-12 w-full">
				<td>
					<figure className="mr-2 flex items-left h-full">
						<div className="m-auto">
							<Img style={{ with: 28, height: 28 }} src={symbolsAssetsMap[sym]} />
						</div>
					</figure>
				</td>
				<td className={cn(p.side === 'Bid' ? 'text-green-500' : 'text-red-500')}>
					{p.side === 'Bid' ? 'Long' : 'Short'}
				</td>
				<td className="text-center">{p.quantity}</td>
				<td className="text-center">{roundDecimal(p.entryPrice, priceDp)}</td>
				<td className="">
					<div className="w-full flex justify-center">
						<div className="truncate ...">
							{tpPrice} / {slPrice}
						</div>
						<div className="">
							<button
								className="w-full flex justify-end items-center s-close-svg-wrapper mr-2 h-4 justify-center"
								onClick={() => onEditTpsl(p)}>
								<img
									className="w-4 h-4 s-filter-white opacity-75 hover:opacity-100 cursor-pointer"
									src="/assets/common/edit.svg"
									alt={'close'}
								/>
							</button>
						</div>
					</div>
				</td>
				<td className="text-center">{roundDecimal(p.liqPrice, priceDp)}</td>
				<td className="text-center">{p.leverage}</td>
				<td className={cn(p.upnl < 0 ? 'text-red-500' : 'text-green-500') + ' text-center'}>{p.upnl}</td>
				<td className="text-center">
					<div className="flex">
						<button
							className="w-full flex justify-end items-center s-close-svg-wrapper mr-2 h-4 justify-center"
							onClick={() => onClosePosition(p, priceDp)}>
							<img
								className="w-4 h-4 s-filter-white opacity-75 hover:opacity-100 cursor-pointer"
								src="/assets/common/close.svg"
								alt={'close'}
							/>
						</button>
					</div>
				</td>
			</tr>
		);
	});
	return pos;
};

const PositionTableRow = ({ setSelectedPosition, setShowEditTpsl }) => {
	const [positions, advancedOrders] = useAppSelector(state => [state.trading.positions, state.trading.advancedOrders]);
};

const findRelevantAO = (advancedOrders, symbol) => {
	let tp = null;
	let sl = null;
	Object.entries(advancedOrders).map(([key, i]) => {
		let order = advancedOrders[key];
		if (order.symbol === symbol) {
			if (order.advancedOrderType === 'TakeProfit') {
				tp = order;
			}
			if (order.advancedOrderType === 'StopLoss') {
				sl = order;
			}
		}
	});
	return { tp, sl };
};
