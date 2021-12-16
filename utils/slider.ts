import { SLIDER } from 'consts/misc/slider';
import { divide, multiply } from 'utils/Big';

export const getLeverageFromSliderValue = (sliderValue: number, maxLeverage: number) => {
	const leverageArr = SLIDER.PRESETS[maxLeverage];
	if (!leverageArr) throw new Error(`Slider preset for ${maxLeverage} not found`);
	if (sliderValue >= SLIDER.MAX) return maxLeverage;
	else if (sliderValue <= 1) return leverageArr[0];
	const value = Number(multiply(divide(sliderValue, SLIDER.MAX, 3), leverageArr.length - 1, 3));
	const baseIndex = Math.floor(value);
	// console.log(
	// 	sliderValue,
	// 	value,
	// 	leverageArr[baseIndex],
	// 	Number(multiply(leverageArr[baseIndex + 1] - leverageArr[baseIndex], value - baseIndex, 1))
	// );
	return (
		leverageArr[baseIndex] +
		Math.round(Number(multiply(leverageArr[baseIndex + 1] - leverageArr[baseIndex], value - baseIndex, 2)) * 10) / 10
	);
};

export const getClosestInOrderedArray = (target: number, array: number[]) => {
	if (target <= array[0]) return 1;
	else if (target >= array[array.length - 1]) return SLIDER.MAX;
	const jumpSize = SLIDER.MAX / (array.length - 1);
	let index;
	for (index = 0; index < array.length; index++) {
		const arrayValue = array[index];
		if (target - arrayValue <= 0) break;
	}
	const width = array[index] - array[index - 1];
	const position = target - array[index - 1];
	const actualPosition = Math.round(Number(multiply(divide(position, width, 3), jumpSize, 3)));
	const ret = (index - 1) * jumpSize + actualPosition;
	// console.log('calculated >>>', ret, index, actualPosition, jumpSize);
	return ret;
};
