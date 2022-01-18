import React, { FormEvent } from 'react';

import cn from 'clsx';
import toNumber from 'lodash-es/toNumber';

import { DialogWrapper } from 'components/dialogs/DIalogs';
import { MakeOrderDialog } from 'components/dialogs/MakeOrder';
import { useMarkPrice } from 'components/DisplaySymbol';
import { ChangeLeverageButton, LeverageArea } from 'components/LeverageArea';
import { DIALOGS, SETTINGS, USER_TYPE } from 'consts';
import { Side, askBidSelector, setOrderLeverage, setOrderQuantity, useOrderbookSelector } from 'contexts';
import { setDialog, setEditLeverage } from 'contexts/modules/layout';
import { useAppDispatch, useAppSelector, useSymbolData, useSymbols } from 'hooks';
import usePrevious from 'hooks/usePrevious';
import { divide, multiply } from 'utils/Big';
import { applyDp, formatNumber, getDollarsToSATS, getSatsToDollar, optionalDecimal } from 'utils/format';
import { isPositiveInteger, isPositiveNumber, isWithinStringDecimalLimit } from 'utils/scripts';
import { TOAST_LEVEL, displayToast } from 'utils/toast';

export const OrderArea = () => {
	const dispatch = useAppDispatch();
	const { bestAsk, bestBid } = useOrderbookSelector(askBidSelector);
	const { priceDp } = useSymbolData();

	const [allowedIp, loggedIn, order, quantity] = useAppSelector(state => [
		state.misc.allowedIp,
		state.user.data.type === USER_TYPE.PRO,
		state.orders.order,
		state.orders.order.quantity,
	]);
	const [clickedSide, setClickedSide] = React.useState<Side>();

	const onButtonClick = React.useCallback(
		(side: Side) => {
			if (quantity === '0' || !quantity) {
				displayToast(<p className="text-sm">Missing Quantity</p>, {
					type: 'error',
					level: TOAST_LEVEL.IMPORTANT,
					toastId: 'req-quantity-place-order',
				});
				return;
			}

			setClickedSide(side);
			if (!allowedIp) {
				displayToast(<p className="text-sm">Not Allowed due to IP address from restricted country</p>, {
					type: 'error',
					level: TOAST_LEVEL.CRITICAL,
					toastId: 'ip-not-allowed-place-order',
				});
				return;
			}
			if (!loggedIn) {
				displayToast(<p className="text-sm">You must be logged in to place orders</p>, {
					type: 'warning',
					level: TOAST_LEVEL.CRITICAL,
					toastId: 'req-login-place-order',
				});
				return;
			}
			dispatch(setDialog(DIALOGS.MAKE_ORDER));
		},
		[allowedIp, loggedIn, order, quantity]
	);

	const confirmationDialog = React.useMemo(() => {
		return (
			<DialogWrapper dialogType={DIALOGS.MAKE_ORDER}>
				<MakeOrderDialog order={order} side={clickedSide} />
			</DialogWrapper>
		);
	}, [clickedSide]);

	return (
		<section className="w-full flex flex-col items-center xs:grid xs:grid-rows-1 xs:grid-cols-7 h-full xs:h-[200px] w-full gap-4 xs:gap-4">
			<SellButton
				onButtonClick={() => onButtonClick(Side.ASK)}
				className="hidden xs:flex"
				bestBid={bestBid}
				priceDp={priceDp}
			/>
			<div className="xs:col-span-3 xs:row-span-1 w-full">
				<OrderInput />
			</div>
			<SellButton
				onButtonClick={() => onButtonClick(Side.ASK)}
				className="flex xs:hidden"
				bestBid={bestBid}
				priceDp={priceDp}
			/>
			<BuyButton onButtonClick={() => onButtonClick(Side.BID)} bestAsk={bestAsk} priceDp={priceDp} />
			{confirmationDialog}
		</section>
	);
};

const OrderInput = () => {
	const { symbol } = useSymbols();
	const [leverage, positions] = useAppSelector(state => [String(state.orders.order.leverage), state.trading.positions]);
	const position = positions[symbol];
	const dispatch = useAppDispatch();
	const editingLeverage = useAppSelector(state => state.layout.editingLeverage);

	const hasPositionLeverage = position?.leverage && position?.quantity !== '0';
	React.useEffect(() => {
		if (!hasPositionLeverage) return;
		dispatch(setOrderLeverage(toNumber(position.leverage)));
	}, [hasPositionLeverage, position?.leverage]);

	const prevSymbol = usePrevious(symbol);

	//	reset input on symbol switch
	React.useEffect(() => {
		// only reset if switching over from BTCUSD.PERP
		if (prevSymbol === 'BTCUSD.PERP' && symbol !== 'BTCUSD.PERP') {
			dispatch(setOrderQuantity(''));
			dispatch(setOrderLeverage(1));
			// dispatch(setOrderQuantity(roundDecimal(getDollarsToSATS(Number(quantity)), 0)));
		}
	}, [symbol, prevSymbol]);

	return (
		<div className="h-full w-full">
			<QuantityInput />
			<div className="w-full mt-1">
				<label className="text-xs text-gray-300 tracking-wider">Leverage</label>
				{!hasPositionLeverage && editingLeverage ? (
					<LeverageArea hasPositionLeverage={hasPositionLeverage} />
				) : (
					<DisplayLeverage leverage={hasPositionLeverage ? position.leverage : leverage} />
				)}
				{!editingLeverage && !hasPositionLeverage && <ChangeLeverageButton />}
				{!editingLeverage && hasPositionLeverage && <div className="h-0 xs:h-[42px]" />}
			</div>
		</div>
	);
};

const QuantityInput = () => {
	const { isInversePriced } = useSymbolData();
	return (
		<div className="w-full">
			<label className="text-xs text-gray-300 tracking-wider">Amount</label>
			{/*because default is BTC and it is inverse*/}
			<div>{isInversePriced === undefined || isInversePriced ? <DollarInput /> : <ContractsInput />}</div>
		</div>
	);
};

const ContractsInput = () => {
	const dispatch = useAppDispatch();
	const [quantity, leverage] = useAppSelector(state => [state.orders.order.quantity, state.orders.order.leverage]);
	const { symbol } = useSymbols();
	const markPrice = useMarkPrice(symbol);

	const satsValue = divide(multiply(quantity ? quantity : 0, markPrice, 0), leverage, 0);
	return (
		<div>
			<div className="bg-gray-700 border-transparent rounded-md w-full relative">
				<div
					style={{ transform: 'translate3d(0,-50%,0)' }}
					className="absolute top-[50%] right-[8px] pl-2 border-l border-gray-600">
					<button
						onClick={() => dispatch(setDialog(DIALOGS.CONTRACT_INFO))}
						className="border border-theme-main rounded-lg px-2 py-1 flex items-center justify-center hover:opacity-80">
						<p className="text-xs">QTY</p>
					</button>
				</div>
				<input
					autoComplete="off"
					id={'input-order-quantity-contracts'}
					min={1}
					max={SETTINGS.LIMITS.NUMBER}
					step={1}
					onInput={(e: FormEvent<HTMLInputElement>) => {
						const value = (e.target as HTMLInputElement).value;
						if (value === '') return dispatch(setOrderQuantity(value));
						if (!isPositiveInteger(value)) return;

						if (Number(value) > SETTINGS.LIMITS.NUMBER) return;
						dispatch(setOrderQuantity(value));
					}}
					value={quantity ? quantity : ''}
					type="text" //	 because of a supposedly android 12 bug, switch to "number" if it gets fixed by breez or android
					placeholder="Amount"
					style={{ paddingRight: '60px' }}
					// placeholder="Quantity"
					className="h-10 xs:h-9 input-default w-full border-transparent border rounded-md focus:border-gray-300 hover:border-gray-300 text-gray-100 bg-gray-700"
				/>
			</div>
			<p className="text-xs text-right pt-1">
				<>
					≈$<span>{formatNumber(getSatsToDollar(satsValue))}</span>
					<br />≈{quantity ? formatNumber(satsValue) : 0}
					<span className="text-[10px] pl-1">SATS</span>
				</>
			</p>
		</div>
	);
};

const DollarInput = () => {
	const dispatch = useAppDispatch();
	const [quantity, leverage] = useAppSelector(state => [state.orders.order.quantity, state.orders.order.leverage]);

	//	convert SATS input to dollars
	React.useEffect(() => {
		if (quantity === '') return;
		dispatch(setOrderQuantity(''));
		// dispatch(setOrderQuantity(roundDecimal(getSatsToDollar(Number(quantity)), 1)));
	}, []);

	return (
		<div>
			<div className="bg-gray-700 border-transparent rounded-md w-full relative">
				<div
					style={{ transform: 'translate3d(0,-50%,0)' }}
					className="absolute top-[50%] right-[8px] pl-2 border-l border-gray-600">
					<button
						onClick={() => dispatch(setDialog(DIALOGS.CONTRACT_INFO))}
						className="border border-theme-main rounded-lg px-2 py-1 flex items-center justify-center hover:opacity-80">
						<p className="text-xs">USD</p>
					</button>
				</div>
				<input
					autoComplete="off"
					id={'input-order-quantity-dollar'}
					min={0}
					max={SETTINGS.LIMITS.NUMBER}
					step={0.01}
					onInput={(e: FormEvent<HTMLInputElement>) => {
						const value = (e.target as HTMLInputElement).value;
						if (value === '') return dispatch(setOrderQuantity(value));
						if (!isWithinStringDecimalLimit(value, 2)) return;
						if (!isPositiveNumber(value)) return;

						if (Number(value) > SETTINGS.LIMITS.NUMBER) return;
						dispatch(setOrderQuantity(value));
					}}
					value={quantity ? quantity : ''}
					type="text" //	 because of a supposedly android 12 bug, switch to "number" if it gets fixed by breez or android
					placeholder="Amount"
					// placeholder="Quantity"
					style={{ paddingRight: '60px' }}
					className="h-10 xs:h-9 input-default w-full border-transparent border rounded-md focus:border-gray-300 hover:border-gray-300 text-gray-100 bg-gray-700"
				/>
			</div>
			<p className="text-sm text-right pt-2">
				<>
					≈{quantity ? formatNumber(getDollarsToSATS(quantity)) : 0}
					<span className="text-xs pl-1">SATS</span>
				</>
			</p>
		</div>
	);
};

const DisplayLeverage = ({ leverage }: { leverage: string }) => {
	return (
		<div className="h-10 xs:h-9 bg-gray-900 border-transparent border-2 rounded-md w-full relative flex items-center">
			<p className="text-right w-full pr-5">{optionalDecimal(leverage)}</p>
			<p className="text-base text-gray-400 pt-[2px] w-[2%] absolute right-[12px] bottom-[6px] xs:bottom-[4px]">x</p>
		</div>
	);
};

const buttonClass =
	'h-14 w-full xs:h-full xs:row-span-1 xs:col-span-2 border-2 border-transparent rounded shadow-elevation-08dp flex flex-col justify-center items-center s-transition-all-fast hover:opacity-80';
const SellButton = ({
	onButtonClick,
	bestBid,
	priceDp,
	className,
}: {
	onButtonClick: () => void;
	bestBid: string;
	priceDp: number;
	className?: string;
}) => {
	return (
		<button onClick={onButtonClick} className={cn(buttonClass, className, 'bg-red-500', { 'opacity-50': !bestBid })}>
			<p className="text-sm xs:text-base">
				Sell
				<span className="pr-1" />/<span className="pr-1" />
				Short
			</p>
			<p className="text-sm xs:text-base">{bestBid && <>${formatNumber(applyDp(bestBid, priceDp))}</>}</p>
		</button>
	);
};

const BuyButton = ({
	onButtonClick,
	bestAsk,
	priceDp,
	className,
}: {
	onButtonClick: () => void;
	bestAsk: string;
	priceDp: number;
	className?: string;
}) => {
	return (
		<button
			onClick={onButtonClick}
			className={cn(buttonClass, className, 'bg-green-600', {
				'opacity-50': !bestAsk,
			})}>
			<p className="text-sm xs:text-base">
				Buy
				<span className="pr-1" />
				/<span className="pr-1" />
				Long
			</p>
			<p className="text-sm xs:text-base">{bestAsk && <>${formatNumber(applyDp(bestAsk, priceDp))}</>}</p>
		</button>
	);
};

// unused
const SATSInput = () => {
	const dispatch = useAppDispatch();
	const quantity = useAppSelector(state => state.orders.order.quantity);

	return (
		<div>
			<div className="bg-gray-700 border-transparent rounded-md w-full h-9 relative">
				<p className="text-xs text-gray-400 absolute right-[9px] bottom-[6px]">SATS</p>
			</div>
			<input
				autoComplete="off"
				id={'input-order-quantity-sats'}
				min={1}
				max={SETTINGS.LIMITS.NUMBER}
				step={1}
				onInput={(e: FormEvent<HTMLInputElement>) => {
					const value = (e.target as HTMLInputElement).value;
					if (value === '') return dispatch(setOrderQuantity(value));
					if (!isPositiveInteger(value)) return;

					if (Number(value) > SETTINGS.LIMITS.SATS_NUMBER) return;
					dispatch(setOrderQuantity(value));
				}}
				value={quantity ? quantity : ''}
				type="text" //	 because of a supposedly android 12 bug, switch to "number" if it gets fixed by breez or android
				placeholder="Amount"
				style={{ paddingRight: '40px' }}
				// placeholder="Quantity"
				className="h-10 input-default w-full border-transparent border rounded-md focus:border-gray-300 hover:border-gray-300 text-gray-100 bg-gray-700"
			/>
			<p className="text-sm text-right pt-2">
				<>≈${quantity ? formatNumber(getSatsToDollar(quantity)) : 0}</>
			</p>
		</div>
	);
};
