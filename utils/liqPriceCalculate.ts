import { CURRENCY } from 'consts/misc/currency';
import { fixed } from 'utils/Big';

const SM = 100000000;
const MAX_PRICE = 100000000000000;

const SIDS = {
	bid: 1,
	ask: -1,
};

const calcValue = (price, quantity, isInverse) => {
	if (isInverse) {
		return (quantity / price) * SM;
	}
	return quantity * price;
};

export const calcLiquidationPriceFromMargin = (
	entryPrice,
	margin,
	quantity,
	side,
	isInverse,
	contractSize,
	fundingRate,
	maintenanceRatio
) => {
	if (!quantity) return 0;
	// console.log(
	// 	'calcLiquidationPriceFromMargin',
	// 	entryPrice,
	// 	margin,
	// 	quantity,
	// 	side,
	// 	isInverse,
	// 	contractSize,
	// 	fundingRate,
	// 	maintenanceRatio
	// );
	let bankruptcyPrice = calcExitPriceFromPnl(entryPrice, -margin, quantity, side, isInverse, contractSize);
	let bankruptcyValue = calcValue(bankruptcyPrice, quantity, isInverse);
	let entryValue = calcValue(entryPrice, quantity, isInverse);

	let sideSign = SIDS[side];
	let fundingAtLiq = Math.max(0, bankruptcyValue * sideSign * fundingRate);
	let feesAtLiq = bankruptcyValue * CURRENCY.TAKER_FEES;
	let maintenanceMargin = entryValue * maintenanceRatio + fundingAtLiq + feesAtLiq;

	return calcExitPriceFromPnl(entryPrice, -(margin - maintenanceMargin), quantity, side, isInverse, contractSize);
};

const calcExitPriceFromPnl = (entryPrice, pnl, quantity, side, isInverse, contractSize) => {
	let sign = SIDS[side];

	if (isInverse) {
		let x = pnl / SM;
		let y = (sign * quantity * contractSize) / entryPrice;

		if (x - y === 0) {
			return MAX_PRICE;
		}

		let exitPrice = (sign * -quantity * contractSize) / (x - y);

		if (exitPrice < 0) {
			return MAX_PRICE;
		}

		return Math.min(exitPrice, MAX_PRICE);
	}

	if (quantity === 0) {
		return MAX_PRICE;
	}

	return Number(fixed(Math.min(MAX_PRICE, pnl / (sign * quantity * contractSize) + entryPrice), 1));
};

// let res = calcLiquidationPriceFromMargin(10000, 500, 1, 'bid', true, 1, 0, 0.005);
// let res = calcLiquidationPriceFromMargin(43767.5, 91, 1, 'bid', true, 1, 0.00025, 0.004);
//
// console.log({ res });
