import React, { FormEvent } from 'react';

import cn from 'clsx';
import Img from 'next/image';

import { QuantityTouchInput } from 'components/TouchInput';
import { SETTINGS } from 'consts';
import { Side, setOrderQuantity } from 'contexts';
import { useAppDispatch, useAppSelector, useSymbolData, useSymbols } from 'hooks';
import { formatNumber } from 'utils/format';
import { isPositiveInteger } from 'utils/scripts';

export const QuantityTouchInputDialog = () => {
	const dispatch = useAppDispatch();
	const quantity = useAppSelector(state => state.orders.order.quantity);
	const { symbolsAssets, symbolIndex, symbol } = useSymbols();
	const { tickSize, isInversePriced } = useSymbolData();
	const minBase = isInversePriced ? 0.01 : 1;

	return (
		<div className="w-full h-full">
			<div className="flex items-center w-full justify-center gap-2">
				<Img width={30} height={30} src={symbolsAssets[symbolIndex]} />
				<h2 className={cn('text-center text-lg xs:text-xl leading-none tracking-wider')}>Quantity Input</h2>
			</div>
			<div className="w-full flex items-center justify-center py-4">
				<input
					value={quantity ? quantity : ''}
					type="number"
					placeholder="Amount"
					min={0}
					max={SETTINGS.LIMITS.NUMBER}
					onInput={(e: FormEvent<HTMLInputElement>) => {
						const value = (e.target as HTMLInputElement).value;
						if (value === '') return dispatch(setOrderQuantity(value));
						if (!isPositiveInteger(value)) return;

						if (Number(value) > SETTINGS.LIMITS.NUMBER) return;
						dispatch(setOrderQuantity(value));
					}}
					className="input-default border border-gray-300 border-opacity-75 bg-gray-700 rounded-lg"
				/>
			</div>
			<div className={cn('w-full flex items-center justify-between')}>
				<QuantityTouchInput base={minBase} />
				<QuantityTouchInput base={minBase * 10} />
				<QuantityTouchInput base={minBase * 100} />
				{isInversePriced && <QuantityTouchInput base={minBase * 1000} />}
			</div>
		</div>
	);
};
