import React, { FormEvent } from 'react';

import cn from 'clsx';
import Img from 'next/image';

import { QuantityTouchInput } from 'components/TouchInput';
import { SETTINGS } from 'consts';
import { Side, setOrderQuantity } from 'contexts';
import { setDialogClose } from 'contexts/modules/layout';
import { useAppDispatch, useAppSelector, useSymbolData, useSymbols } from 'hooks';
import { formatNumber } from 'utils/format';
import { isPositiveInteger } from 'utils/scripts';

export const QuantityTouchInputDialog = () => {
	const dispatch = useAppDispatch();
	const quantity = useAppSelector(state => state.orders.order.quantity);
	const { symbolsAssets, symbolIndex, symbol } = useSymbols();
	const { isInversePriced } = useSymbolData();

	const minBase = isInversePriced ? 0.01 : 1; //	0.01 for dollar cents, 1 for per contract.

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
					className="input-default bg-gray-700 rounded-lg"
				/>
			</div>
			<div className={cn('w-full flex items-center justify-between')}>
				<QuantityTouchInput base={minBase} />
				<QuantityTouchInput base={minBase * 10} />
				<QuantityTouchInput base={minBase * 100} />
				<QuantityTouchInput base={minBase * 1000} />
			</div>
			<div className="mt-8 flex items-center justify-center">
				<button
					onClick={() => dispatch(setDialogClose())}
					className="w-3/4 px-5 py-2 flex items-center justify-center rounded-lg border border-theme-main border-opacity-75">
					<p>Close</p>
				</button>
			</div>
		</div>
	);
};
