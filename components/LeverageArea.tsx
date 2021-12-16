import React, { FormEvent } from 'react';

import { Slider } from 'components/Slider';
import { SLIDER } from 'consts/misc/slider';
import { setOrderLeverage } from 'contexts';
import { useAppDispatch, useSymbols } from 'hooks';
import { getClosestInOrderedArray, getLeverageFromSliderValue } from 'utils/slider';

export const LeverageArea = () => {
	const dispatch = useAppDispatch();
	const { symbol, symbolData } = useSymbols();
	const [value, setValue] = React.useState<number | string>(1);
	const [sliderValue, setSliderValue] = React.useState(1);
	const maxLeverage = symbolData?.[symbol] ? Number(symbolData[symbol]?.maxLeverage) : 100;

	const updateValue = React.useCallback(
		(newValue: number) => {
			if (!newValue) {
				setValue('');
				setSliderValue(1);
				dispatch(setOrderLeverage(1));
				return;
			}
			setSliderValue(getClosestInOrderedArray(newValue, SLIDER.PRESETS[maxLeverage]));
			dispatch(setOrderLeverage(newValue));
			setValue(newValue);
		},
		[maxLeverage]
	);

	const updateSlider = React.useCallback(
		(newValue: { x: number }) => {
			setSliderValue(newValue.x);
			const leverage = getLeverageFromSliderValue(newValue.x, maxLeverage);
			setValue(leverage);
			dispatch(setOrderLeverage(leverage));
		},
		[maxLeverage]
	);

	return React.useMemo(
		() => (
			<section className="w-full">
				<div className="w-full">
					<label className="text-xs text-gray-300 tracking-wider">Leverage</label>
					<div className="h-10 xs:h-9 bg-gray-700 border-transparent border-2 rounded-md w-full relative">
						<input
							min={1}
							max={maxLeverage}
							className="input-default inline-block w-full rounded-md border border-transparent focus:border-gray-300 hover:border-gray-300"
							type="number"
							placeholder="Leverage"
							value={value}
							onInput={(e: FormEvent<HTMLInputElement>) => {
								if ((e.target as HTMLInputElement).value === '') return updateValue(undefined);
								const input = Number((e.target as HTMLInputElement).value);
								if (input > 100 || input < 1) return;
								updateValue(input);
							}}
						/>
						{Number(value) !== 0 && (
							<p className="text-base text-gray-400 pt-[2px] w-[2%] absolute right-[12px] bottom-[7px] xs:bottom-[3px]">
								x
							</p>
						)}
					</div>
				</div>
				<div className="w-full px-1 mt-5 xs:mt-2">
					<Slider value={sliderValue ? sliderValue : 1} setValue={updateSlider} maxLeverage={maxLeverage} />
					<LeverageSliderTicks maxLeverage={maxLeverage} />
				</div>
			</section>
		),
		[value, setValue, sliderValue, maxLeverage, updateValue]
	);
};

const LeverageSliderTicks = ({ maxLeverage }: { maxLeverage: number }) => {
	const tickValues = SLIDER.PRESETS[maxLeverage];
	const tickDiv = tickValues?.length - 1;
	return (
		<figure className="w-full h-4 pr-[5px] pt-2">
			<div className="relative h-full">
				{tickValues &&
					tickValues.map((value: number, index: number) => {
						return (
							<span
								key={index}
								className="absolute text-[10px] text-gray-"
								style={{ left: `${(index * 100) / tickDiv}%`, transform: 'translate(-50%, -5px)' }}>
								{value}
							</span>
						);
					})}
			</div>
		</figure>
	);
};
