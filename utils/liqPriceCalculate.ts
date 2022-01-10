import Big from 'big.js';

import { CURRENCY } from 'consts/misc/currency';
import { Side } from 'contexts';
import { divide, minus, multiply } from 'utils/Big';

const MAX_PRICE = 100000000000000;

const calcValue = (price: number, quantity: number, contractSize: number, isInverse?: boolean) => {
	if (isInverse) {
		return Number(multiply(divide(multiply(quantity, contractSize), price), CURRENCY.SATS_PER_BTC));
	}
	return Number(multiply(multiply(quantity, contractSize), price));
};

const calcLiquidationPriceFromMargin = (
	entryPrice: number,
	margin: number,
	quantity: number,
	side: Side,
	fundingRate: number,
	contractInfo: { contractSize: number; maintenanceRatio: number; takerFee: number; isInverse?: boolean }
) => {
	const bankruptcyPrice = calcExitPriceFromPnl(
		entryPrice,
		-margin,
		quantity,
		side,
		contractInfo.contractSize,
		contractInfo.isInverse
	);
	const bankruptcyValue = calcValue(bankruptcyPrice, quantity, contractInfo.contractSize);
	const entryValue = calcValue(entryPrice, quantity, contractInfo.contractSize);

	const sideSign = side === Side.ASK ? -1 : 1;
	const fundingAtLiq = Math.max(0, bankruptcyValue * sideSign * fundingRate);
	const feesAtLiq = bankruptcyValue * contractInfo.takerFee;
	const maintenanceMargin = entryValue * contractInfo.maintenanceRatio + fundingAtLiq + feesAtLiq;

	return calcExitPriceFromPnl(
		entryPrice,
		-(margin - maintenanceMargin),
		quantity,
		side,
		contractInfo.contractSize,
		contractInfo.isInverse
	);
};

const calcExitPriceFromPnl = (
	entryPrice: number,
	pnl: number,
	quantity: number,
	side: Side,
	contractSize: number,
	isInverse?: boolean
) => {
	const sideSign = side === Side.ASK ? -1 : 1;

	if (isInverse) {
		const x = pnl / CURRENCY.SATS_PER_BTC;
		const y = new Big(sideSign).mul(quantity).mul(contractSize).div(entryPrice).toNumber();

		if (x - y === 0) {
			return MAX_PRICE;
		}

		const exitPrice = Number(divide(multiply(multiply(sideSign, quantity), contractSize), minus(y, x)));

		if (exitPrice < 0) {
			return MAX_PRICE;
		}

		return Math.min(exitPrice, MAX_PRICE);
	}

	if (quantity === 0) {
		return MAX_PRICE;
	}

	return Math.min(
		MAX_PRICE,
		new Big(pnl).div(new Big(sideSign).mul(quantity).mul(contractSize)).add(entryPrice).toNumber()
	);
};

// let res = calcLiquidationPriceFromMargin(10000, 500, 1, 'Bid', true, 1, 0, 0.005);
