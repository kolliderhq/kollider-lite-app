import React, { Dispatch, SetStateAction } from 'react';
import InputSlider, { InputSliderProps } from 'react-input-slider';

import { SLIDER } from 'consts/misc/slider';

const sliderOptions = {
	styles: {
		track: {
			height: '12px',
			backgroundColor: '#4c5264',
			width: '98%',
		},
		active: {
			backgroundColor: '#4b4acf',
		},
		thumb: {
			height: '20px',
			width: '20px',
			backgroundColor: '#fff',
			cursor: 'pointer',
		},
	},
};

export const Slider = ({
	value,
	setValue,
}: {
	value: number;
	setValue: (newValue: { x: number }) => void;
	maxLeverage: number;
}) => {
	return <InputSlider xmin={1} xmax={SLIDER.MAX} {...sliderOptions} axis="x" x={value} onChange={setValue} />;
};
