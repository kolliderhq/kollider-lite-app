import React, { ReactNode } from 'react';

import cn from 'clsx';

import Loader from 'components/Loader';
import { SETTINGS } from 'consts';
import { CURRENCY } from 'consts/misc/currency';
import { Side, askBidSelector, useOrderbookSelector } from 'contexts';
import { useAppSelector, useSymbolData, useSymbols } from 'hooks';
import { divide, fixed, multiply } from 'utils/Big';
import { applyDp, formatNumber, getSatsToDollar } from 'utils/format';
import { calcLiquidationPriceFromMargin } from 'utils/liqPriceCalculate';

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

	const askOrderValue = getOrderValue(bestAsk, priceDp, quantity, symbol, contractSize);
	const [askData, setAskData] = React.useState<SideData>({} as SideData);
	React.useEffect(() => {
		setAskData({
			margin: divide(askOrderValue, leverage, 0),
			orderValue: fixed(askOrderValue, 0),
			fees: multiply(CURRENCY.TAKER_FEES, askOrderValue, 0),
			isInaccurate: bestAskAmount < quantity,
			liqPrice: bestAsk
				? fixed(
						calcLiquidationPriceFromMargin(
							Number(applyDp(bestAsk, priceDp)),
							Number(divide(askOrderValue, leverage, 0)),
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
	}, [askOrderValue, bestAsk, bestAskAmount, quantity, leverage, fundingRate]);
	const bidOrderValue = getOrderValue(bestBid, priceDp, quantity, symbol, contractSize);
	const [bidData, setBidData] = React.useState<SideData>({} as SideData);
	React.useEffect(() => {
		setBidData({
			margin: divide(bidOrderValue, leverage, 0),
			orderValue: fixed(bidOrderValue, 0),
			fees: multiply(CURRENCY.TAKER_FEES, bidOrderValue, 0),
			isInaccurate: bestBidAmount < quantity,
			liqPrice: bestBid
				? fixed(
						calcLiquidationPriceFromMargin(
							Number(applyDp(bestBid, priceDp)),
							Number(divide(bidOrderValue, leverage, 0)),
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
	}, [bidOrderValue, bestBid, bestBidAmount, leverage, quantity, fundingRate]);

	return (
		<div className="w-full">
			{side === Side.ASK ? (
				<div className="border border-red-600 border-opacity-75 rounded-lg bg-gray-950 p-4">
					<DisplayOrderData price={applyDp(bestBid, priceDp)} loaded={!!bestBid} data={bidData} />
				</div>
			) : (
				<div className="border border-green-600 border-opacity-75 rounded-lg bg-gray-950 p-4">
					<DisplayOrderData price={applyDp(bestAsk, priceDp)} loaded={!!bestAsk} data={askData} />
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

const getOrderValue = (price, priceDp, quantity, symbol, contractSize) => {
	if (symbol === 'BTCUSD.PERP') {
		const div = divide(CURRENCY.SATS_PER_BTC, applyDp(price ? price : 1, priceDp), 10);
		return multiply(!isNaN(Number(div)) ? div : 0, quantity ? quantity : 0, 10);
	}
	const div = multiply(applyDp(price ? price : 1, priceDp), contractSize);
	return multiply(!isNaN(Number(div)) ? div : 0, quantity ? quantity : 0, 10);
};

const DisplayOrderData = ({
	loaded,
	data,
	className = '',
	price,
}: {
	loaded: boolean;
	data: SideData;
	className?: string;
	price: string;
}) => {
	return (
		<ul className={cn('grid grid-rows-auto gap-3', className)}>
			{loaded ? (
				<>
					<li className="flex items-center justify-between">
						<div>
							<LabelledValue label={'Price'} innacurate={data.isInaccurate}>
								${formatNumber(price)}
							</LabelledValue>
						</div>
						<div className="text-right">
							<LabelledValue label={'Liq. Price'} innacurate={data.isInaccurate}>
								{Number(data.liqPrice) > SETTINGS.LIMITS.NUMBER ? (
									'∞'
								) : (
									<>
										<span className="pr-1 text-xs xxs:text-sm xs:text-base break-normal">$</span>
										{formatNumber(data.liqPrice)}
									</>
								)}
							</LabelledValue>
						</div>
					</li>
					<li>
						<LabelledValue label={'Margin'} innacurate={data.isInaccurate}>
							{formatNumber(data.margin)}
							<span className="pl-1 text-xs xxs:text-sm xs:text-base break-normal">SATS</span>
							<span className="pl-2 text-xxs xxs:text-xs xs:text-sm">
								{getSatsToDollar(data.margin) === '0.00' ? '>' : '≈'}${getSatsToDollar(data.margin)}
							</span>
						</LabelledValue>
					</li>
					<li>
						<LabelledValue label={'Fees'} innacurate={data.isInaccurate}>
							{formatNumber(data.fees)}
							<span className="pl-1 text-xs xxs:text-sm xs:text-base break-normal">SATS</span>
							<span className="pl-2 text-xxs xxs:text-xs xs:text-sm">
								{getSatsToDollar(data.fees) === '0.00' ? '>' : '≈'}${getSatsToDollar(data.fees)}
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
}: {
	label: string;
	children: ReactNode;
	innacurate: boolean;
}) => {
	return (
		<>
			<p className="text-[11px] leading-tight text-gray-300 tracking-wider">{label}</p>
			<p className="text-sm xxs:text-base xs:text-[18px] break-all leading-none">
				{innacurate && '≈'}
				{children}
			</p>
		</>
	);
};
