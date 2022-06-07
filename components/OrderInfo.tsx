import React, { ReactNode } from 'react';

import cn from 'clsx';

import Loader from 'components/Loader';
import { CURRENCY } from 'consts/misc/currency';
import { Side, askBidSelector, useOrderbookSelector } from 'contexts';
import { useAppSelector, useSymbolData, useSymbols } from 'hooks';
import { divide, fixed, minus, mod, multiply } from 'utils/Big';
import { applyDp, formatNumber, getDollarsToSATS, getSatsToDollar, limitNumber, symbolToCurrencySymbol } from 'utils/format';
import { calcLiquidationPriceFromMargin } from 'utils/liqPriceCalculate';
import { SymbolsLoadedWrapper } from './wrappers/SymbolsLoadedWrapper';

export function OrderInfo({ side }: { side: Side }) {
	const [{ quantity, leverage }, fundingRates] = useAppSelector(state => [
		state.orders.order,
		state.prices.fundingRates,
	]);
	const { bestAsk, bestBid, bestAskAmount, bestBidAmount } = useOrderbookSelector(askBidSelector);
	const { priceDp, contractSize, isInversePriced, maintenanceMargin } = useSymbolData();
	const { symbol } = useSymbols();
	const fundingRate = Number(fundingRates[symbol]);
	const contractInfo = {
		contractSize: Number(contractSize),
		maintenanceRatio: Number(maintenanceMargin),
		takerFee: CURRENCY.TAKER_FEES,
		isInverse: isInversePriced,
	};

	const askOrderValue = getOrderValue(bestBid, leverage, priceDp, quantity, symbol, contractSize);
	const askNotionalValue = getOrderValue(bestBid, 1, priceDp, quantity, symbol, contractSize);
	const [askData, setAskData] = React.useState<SideData>({} as SideData);
	React.useEffect(() => {
		setAskData({
			margin: fixed(askOrderValue, 0),
			orderValue: fixed(askOrderValue, 0),
			fees: multiply(CURRENCY.TAKER_FEES, askNotionalValue, 0),
			isInaccurate: bestAskAmount < Number(quantity),
			liqPrice: bestBid
				? fixed(
						calcLiquidationPriceFromMargin(
							Number(applyDp(bestBid, priceDp)),
							Number(fixed(askOrderValue, 0)),
							quantity,
							'ask',
							contractInfo.isInverse,
							contractInfo.contractSize,
							fundingRate,
							contractInfo.maintenanceRatio
						),
						priceDp
				  )
				: '0',
		});
	}, [askOrderValue, bestBid, bestAskAmount, quantity, leverage, fundingRate]);
	const bidOrderValue = getOrderValue(bestAsk, leverage, priceDp, quantity, symbol, contractSize);
	const bidNotionalValue = getOrderValue(bestAsk, 1, priceDp, quantity, symbol, contractSize);
	const [bidData, setBidData] = React.useState<SideData>({} as SideData);
	React.useEffect(() => {
		setBidData({
			margin: fixed(bidOrderValue, 0),
			orderValue: fixed(bidOrderValue, 0),
			fees: multiply(CURRENCY.TAKER_FEES, bidNotionalValue, 0),
			isInaccurate: bestBidAmount < Number(quantity),
			liqPrice: bestAsk
				? fixed(
						calcLiquidationPriceFromMargin(
							Number(applyDp(bestAsk, priceDp)),
							Number(fixed(bidOrderValue, 0)),
							quantity,
							'bid',
							contractInfo.isInverse,
							contractInfo.contractSize,
							fundingRate,
							contractInfo.maintenanceRatio
						),
						priceDp
				  )
				: '0',
		});
	}, [bidOrderValue, bestAsk, bestBidAmount, leverage, quantity, fundingRate]);

	return (
		<div className="w-full">
			{side === Side.ASK ? (
				<div className="border border-red-600 border-opacity-75 rounded-lg bg-gray-950 p-4">
					<DisplayOrderData price={applyDp(bestBid, priceDp)} loaded={!!bestBid} data={askData} symbol={symbol}/>
				</div>
			) : (
				<div className="border border-green-600 border-opacity-75 rounded-lg bg-gray-950 p-4">
					<DisplayOrderData price={applyDp(bestAsk, priceDp)} loaded={!!bestAsk} data={bidData} symbol={symbol}/>
				</div>
			)}
		</div>
	);
}

interface SideData {
	margin: string;
	orderValue: string;
	fees: string;
	isInaccurate: boolean;
	liqPrice: string;
}

export const getOrderValue = (price, leverage, priceDp, quantity, symbol, contractSize) => {
	const actualPrice = applyDp(price ? price : 1, priceDp);
	if (symbol === 'BTCUSD.PERP') {
		const notionalValue = quantity / actualPrice * CURRENCY.SATS_PER_BTC
		let realValue = notionalValue / leverage
		return  realValue
	}
	const satContractPrice = multiply(actualPrice, contractSize);
	const value = divide(
		multiply(!isNaN(Number(satContractPrice)) ? satContractPrice : 0, quantity ? quantity : 0, 10),
		leverage,
		0
	);
	return value;
};

const DisplayOrderData = ({
	loaded,
	data,
	className = '',
	price,
	symbol,
}: {
	loaded: boolean;
	data: SideData;
	className?: string;
	price: string;
	symbol: string;
}) => {
	return (
		<ul className={cn('grid grid-rows-auto gap-3', className)}>
			{loaded ? (
				<>
					<li className="flex items-center justify-between">
						<div>
							<LabelledValue childClass="text-base" label={'Price'} innacurate={data.isInaccurate}>
								<span className="pr-0.5 text-sm break-normal">{symbolToCurrencySymbol(symbol)}</span>
								{formatNumber(price)}
							</LabelledValue>
						</div>
						<div className="text-right">
							<LabelledValue childClass="text-base" label={'Liq. Price'} innacurate={data.isInaccurate}>
								<span className="pr-0.5 text-sm break-normal">{symbolToCurrencySymbol(symbol)}</span>
								{formatNumber(limitNumber(data.liqPrice))}
							</LabelledValue>
						</div>
					</li>
					<li>
						<LabelledValue childClass="text-base" label={'Margin'} innacurate={data.isInaccurate}>
							{formatNumber(data.margin)}
							<span className="pl-1 text-sm break-normal">SATS</span>
							<span className="pl-2 text-sm">
								{getSatsToDollar(data.margin) === '0.00' ? '>' : '≈'}{symbolToCurrencySymbol(symbol)}{getSatsToDollar(data.margin)}
							</span>
						</LabelledValue>
					</li>
					<li>
						<LabelledValue childClass="text-base" label={'Fees'} innacurate={data.isInaccurate}>
							{formatNumber(data.fees)}
							<span className="pl-1 text-sm break-normal">SATS</span>
							<span className="pl-2 text-sm">
								{getSatsToDollar(data.fees) === '0.00' ? '>' : '≈'}{symbolToCurrencySymbol(symbol)}{getSatsToDollar(data.fees)}
							</span>
						</LabelledValue>
					</li>
				</>
			) : (
				<div className="h-[140px]">
					<Loader />
				</div>
			)}
		</ul>
	);
};

const LabelledValue = ({
	label,
	children,
	innacurate,
	childClass,
}: {
	label: string;
	children: ReactNode;
	innacurate: boolean;
	childClass?: string;
}) => {
	return (
		<>
			<p className="text-[11px] leading-tight text-gray-300 tracking-wider">{label}</p>
			<p className={cn('break-all leading-none', childClass ? childClass : 'text-sm xxs:text-base xs:text-[18px]')}>
				{innacurate && '≈'}
				{children}
			</p>
		</>
	);
};
