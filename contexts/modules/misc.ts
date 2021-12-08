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
	confirmation: Confirmation;
}

const initialState: InitMisc = {
	allowedIp: null,

	utmSource: '',
	symbolLoad: '',
	confirmation: {
		title: '',
		content: '',
		callback: () => {},
	},
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
		setConfirmation: (state, action: PayloadAction<Partial<Confirmation>>) => {
			state.confirmation = { ...state.confirmation, ...action.payload };
		},
	},
});

export const { setAllowedIp, setUtmSource, setSymbolLoad, setConfirmation } = miscSlice.actions;

export default miscSlice.reducer;
