import React, { FormEvent, useState } from 'react';
import { useSwipeable } from 'react-swipeable';

import cn from 'clsx';
import toNumber from 'lodash-es/toNumber';

import { MakeOrderDialog } from 'components/dialogs/MakeOrder';
import { ChangeLeverageButton, LeverageArea } from 'components/LeverageArea';
import { DefaultLoader } from 'components/Loader';
import { DIALOGS, SETTINGS, USER_TYPE } from 'consts';
import { Side, askBidSelector, setOrderLeverage, setOrderQuantity, useOrderbookSelector } from 'contexts';
import { setDialog } from 'contexts/modules/layout';
import { useAppDispatch, useAppSelector, useSymbolData, useSymbols } from 'hooks';
import { useGetLiqPrice } from 'hooks/useGetLiqPrice';
import { useMarkPrice } from 'hooks/useMarkPrice';
import usePrevious from 'hooks/usePrevious';
import { divide, multiply } from 'utils/Big';
import { applyDp, formatNumber, getDollarsToSATS, getSatsToDollar, limitNumber, optionalDecimal, symbolToCurrencySymbol } from 'utils/format';
import { isPositiveInteger, isPositiveNumber, isWithinStringDecimalLimit } from 'utils/scripts';
import { TOAST_LEVEL, displayToast } from 'utils/toast';
import { WrapBaseDialog } from './dialogs';

export const OrderArea = () => {
	const dispatch = useAppDispatch();
	const { bestAsk, bestBid } = useOrderbookSelector(askBidSelector);
	const { priceDp, symbol } = useSymbolData();
	const [showOrderConfirmationDialog, setShowOrderConfirmationDialog] = useState(false);

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
			setShowOrderConfirmationDialog(true)
			// dispatch(setDialog(DIALOGS.MAKE_ORDER));
		},
		[allowedIp, loggedIn, order, quantity]
	);

	return (
		<section className="flex flex-col items-center h-full gap-4 w-full">
			<WrapBaseDialog isOpen={showOrderConfirmationDialog} close={() => setShowOrderConfirmationDialog(false)}>
				<MakeOrderDialog order={order} side={clickedSide} setIsOpen={setShowOrderConfirmationDialog}/>
			</WrapBaseDialog>
			<div className="xs:col-span-3 xs:row-span-1 w-full">
				<OrderInput />
			</div>
			<BuyButton onButtonClick={() => onButtonClick(Side.BID)} bestAsk={bestAsk} priceDp={priceDp} symbol={symbol} />
			<SellButton
				onButtonClick={() => onButtonClick(Side.ASK)}
				className="flex"
				bestBid={bestBid}
				priceDp={priceDp}
				symbol={symbol}
			/>
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
			<div className="w-full">
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
	const [toggleInput, setToggleInput] = React.useState(true);
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
	const tapHandler = useSwipeable({
		onTap: () => {
			dispatch(setDialog(DIALOGS.QUANTITY_TOUCH_INPUT));
		},
	});

	const satsValue = divide(multiply(quantity ? quantity : 0, markPrice, 0), leverage, 0);
	return (
		<div>
			<div className="bg-gray-700 border-transparent rounded-md w-full relative">
				<div
					style={{ transform: 'translate3d(0,-50%,0)' }}
					className="absolute top-[50%] right-[8px] pl-2 border-l border-gray-600"
				>
					<button
						onClick={() => dispatch(setDialog(DIALOGS.CONTRACT_INFO))}
						className="border border-theme-main rounded-lg px-2 py-1 flex items-center justify-center hover:opacity-80"
					>
						<p className="text-xs">QTY</p>
					</button>
				</div>
				<input
					{...tapHandler}
					autoComplete="off"
					id={'input-order-quantity-contracts'}
					min={0}
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
					type="number" //	 because of a supposedly android 12 bug, switch to "number" if it gets fixed by breez or android
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
	const { symbol } = useSymbols();
	const [quantity, leverage] = useAppSelector(state => [state.orders.order.quantity, state.orders.order.leverage]);
	const [baseCurrency, setBaseCurrency] = useState("");

	//	convert SATS input to dollars
	React.useEffect(() => {
		if (quantity === '') return;
		dispatch(setOrderQuantity(''));
		// dispatch(setOrderQuantity(roundDecimal(getSatsToDollar(Number(quantity)), 1)));
	}, []);

	React.useEffect(() => {
		if (!symbol) return
		setBaseCurrency(symbol.substring(3, 6));
	}, [symbol])

	const tapHandler = useSwipeable({
		onTap: () => {
			dispatch(setDialog(DIALOGS.QUANTITY_TOUCH_INPUT));
		},
	});

	return (
		<div>
			<div className="bg-gray-700 border-transparent rounded-md w-full relative">
				<div
					style={{ transform: 'translate3d(0,-50%,0)' }}
					className="absolute top-[50%] right-[8px] pl-2 border-l border-gray-600"
				>
					<button
						onClick={() => dispatch(setDialog(DIALOGS.CONTRACT_INFO))}
						className="border border-theme-main rounded-lg px-2 py-1 flex items-center justify-center hover:opacity-80"
					>
						<p className="text-xs">{baseCurrency}</p>
					</button>
				</div>
				<input
					{...tapHandler}
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
					type="number"
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
	'h-20 py-2 w-full xs:h-full xs:row-span-1 xs:col-span-2 border-2 border-transparent rounded shadow-elevation-08dp grid grid-rows-2 xs:flex xs:flex-col justify-center items-center s-transition-all-fast hover:opacity-80';
const SellButton = ({
	onButtonClick,
	bestBid,
	priceDp,
	symbol,
	className,
}: {
	onButtonClick: () => void;
	bestBid: string;
	priceDp: number;
	symbol: string;
	className?: string;
}) => {
	const quantity = useAppSelector(state => state.orders.order.quantity);
	const liqPrice = useGetLiqPrice(Side.ASK);
	return (
		<button
			onClick={onButtonClick}
			className={cn(
				buttonClass,
				className,
				'bg-red-500',
				{ 'opacity-50': !bestBid },
				quantity !== '' ? 'grid-cols-2' : 'grid-cols-1'
			)}
		>
			<p className="text-base order-1 xs:order-1 col-span-2">
				Sell
				<span className="pr-1" />/<span className="pr-1" />
				Short
			</p>
			<div
				className={cn('flex flex-col items-center xs:mt-2 order-2 xs:order-2 pb-2 xs:pb-0', {
					'pl-5 xs:pl-0': quantity !== '',
				})}
			>
				<p className="text-[10px] leading-none mb-0.5">Price</p>
				<p className=" leading-none xs:leading-none text-base xs:text-lg">
					{bestBid ? <>{symbolToCurrencySymbol(symbol)}{formatNumber(applyDp(bestBid, priceDp))}</> : <DefaultLoader wrapperClass="h-5 pt-2" />}
				</p>
			</div>
			{quantity !== '' && (
				<div className="flex flex-col items-center xs:mt-1 order-3 xs:order-3 pb-2 xs:pb-0 pr-5 xs:pr-0">
					<p className="text-[10px] leading-none mb-0.5">Liq. Price</p>
					<p className="leading-none xs:leading-none text-base xs:text-lg">
						{bestBid ? (
							<>{symbolToCurrencySymbol(symbol)}{Number(liqPrice) > 0 || !isNaN(Number(liqPrice)) ? formatNumber(limitNumber(liqPrice)) : '-'}</>
						) : (
							<DefaultLoader wrapperClass="h-5 pt-2" />
						)}
					</p>
				</div>
			)}
		</button>
	);
};

const BuyButton = ({
	onButtonClick,
	bestAsk,
	priceDp,
	symbol,
	className,
}: {
	onButtonClick: () => void;
	bestAsk: string;
	priceDp: number;
	symbol: string;
	className?: string;
}) => {
	const quantity = useAppSelector(state => state.orders.order.quantity);
	const liqPrice = useGetLiqPrice(Side.BID);
	return (
		<button
			onClick={onButtonClick}
			className={cn(
				buttonClass,
				className,
				'bg-green-600',
				{
					'opacity-50': !bestAsk,
				},
				quantity !== '' ? 'grid-cols-2' : 'grid-cols-1'
			)}
		>
			<p className="text-base order-1 xs:order-1 col-span-2">
				Buy
				<span className="pr-1" />
				/<span className="pr-1" />
				Long
			</p>
			<div
				className={cn('flex flex-col items-center xs:mt-2 order-2 xs:order-2 pb-2 xs:pb-0', {
					'pl-5 xs:pl-0': quantity !== '',
				})}
			>
				<p className="text-[10px] leading-none mb-0.5">Price</p>
				<p className=" leading-none xs:leading-none text-base xs:text-lg">
					{bestAsk ? <>{symbolToCurrencySymbol(symbol)}{formatNumber(applyDp(bestAsk, priceDp))}</> : <DefaultLoader wrapperClass="h-5 pt-2" />}
				</p>
			</div>
			{quantity !== '' && (
				<div className="flex flex-col items-center xs:mt-1 order-3 xs:order-3 pb-2 xs:pb-0 pr-5 xs:pr-0">
					<p className="text-[10px] leading-none mb-0.5">Liq. Price</p>
					<p className="leading-none xs:leading-none text-base xs:text-lg">
						{bestAsk ? (
							<>{symbolToCurrencySymbol(symbol)}{Number(liqPrice) > 0 ? formatNumber(limitNumber(liqPrice)) : '-'}</>
						) : (
							<DefaultLoader wrapperClass="h-5 pt-2" />
						)}
					</p>
				</div>
			)}
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
