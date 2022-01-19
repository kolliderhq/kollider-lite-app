import { getOrderValue } from 'components/OrderInfo';
import { CURRENCY } from 'consts/misc/currency';
import { Side, askBidSelector, useOrderbookSelector } from 'contexts';
import { useAppSelector } from 'hooks/redux';
import { useSymbolData, useSymbols } from 'hooks/useSymbols';
import { fixed, multiply } from 'utils/Big';
import { applyDp } from 'utils/format';
import { calcLiquidationPriceFromMargin } from 'utils/liqPriceCalculate';

export const useGetLiqPrice = (side: Side) => {
	const [{ quantity: storeQuantity, leverage }, fundingRates] = useAppSelector(state => [
		state.orders.order,
		state.prices.fundingRates,
	]);
	const quantity = storeQuantity ? storeQuantity : 1;
	const { bestAsk, bestBid } = useOrderbookSelector(askBidSelector);
	const { priceDp, contractSize, isInversePriced, maintenanceMargin } = useSymbolData();
	const { symbol } = useSymbols();
	const fundingRate = Number(fundingRates[symbol]);
	const contractInfo = {
		contractSize: Number(contractSize),
		maintenanceRatio: Number(maintenanceMargin),
		takerFee: CURRENCY.TAKER_FEES,
		isInverse: isInversePriced,
	};
	const sideBest = side === Side.ASK ? bestBid : bestAsk;
	const sideOrderValue = getOrderValue(sideBest, leverage, priceDp, quantity, symbol, contractSize);
	return fixed(
		calcLiquidationPriceFromMargin(
			Number(applyDp(sideBest, priceDp)),
			Number(fixed(sideOrderValue, 0)),
			contractInfo.isInverse ? Number(multiply(quantity, leverage)) : Number(quantity),
			side === Side.ASK ? 'ask' : 'bid',
			contractInfo.isInverse,
			contractInfo.contractSize,
			fundingRate,
			contractInfo.maintenanceRatio
		),
		priceDp
	);
};
