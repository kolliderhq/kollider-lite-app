import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { Nullable } from '../../utils/types/utils';

export interface Confirmation {
	title: string;
	content: string;
	callback: (...args: any[]) => void;
}

interface InitMisc {
	allowedIp: Nullable<boolean>;

	utmSource: string;
	symbolLoad: string;
	// confirmation: Confirmation; -> reduced to
}

const initialState: InitMisc = {
	allowedIp: null,

	utmSource: '',
	symbolLoad: '',
};

export const miscSlice = createSlice({
	name: 'misc',
	initialState,
	reducers: {
		setAllowedIp: (state, action: PayloadAction<boolean>) => {
			state.allowedIp = action.payload;
		},
		setUtmSource: (state, action: PayloadAction<string>) => {
			state.utmSource = action.payload;
		},
		setSymbolLoad: (state, action: PayloadAction<string>) => {
			state.symbolLoad = action.payload;
		},
	},
});

export const { setAllowedIp, setUtmSource, setSymbolLoad } = miscSlice.actions;

export default miscSlice.reducer;
