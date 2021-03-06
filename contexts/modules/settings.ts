import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import toPlainObject from 'lodash-es/toPlainObject';

import { defaultLocalStore } from 'contexts';

export interface Settings {
	denom: string;

	onlyWeblnIfEnabled: boolean;
	weblnAutoWithdraw: number;
	isToastsShown: boolean;
	persisted: boolean;
	isFirstRun: boolean;
}

const initialState: Settings = {
	denom: 'SATS',

	onlyWeblnIfEnabled: true, //	hides invoices if enabled
	weblnAutoWithdraw: 100, //	auto withdrawal does not happen if enabled
	isToastsShown: true, //	not sure whether market makers will be here but ok
	persisted: false,
	isFirstRun: true,
};

export const settingsSlice = createSlice({
	name: 'settings',
	initialState,
	reducers: {
		setPersistSettings: (state, action: PayloadAction<Settings>) => {
			// TODO : remove this after a few weeks(21/12/31)
			if (action.payload.weblnAutoWithdraw === 1) action.payload.weblnAutoWithdraw = 100;

			Object.keys(action.payload).forEach(key => {
				state[key] = action.payload[key];
			});
		},
		setFirstLoad: state => {
			state.persisted = true;
			state.isFirstRun = false;
		},
		setDenom: (state, action: PayloadAction<string>) => {
			state.denom = action.payload;
			defaultLocalStore.set('settings', toPlainObject(state));
		},
		setOnlyWeblnIfEnabled: (state, action: PayloadAction<boolean>) => {
			state.onlyWeblnIfEnabled = action.payload;
		},
		setWeblnAutoWithdraw: (state, action: PayloadAction<number>) => {
			if (action.payload <= 0) state.weblnAutoWithdraw = 0;
			else state.weblnAutoWithdraw = action.payload;
		},
		setIsToastsShown: (state, action: PayloadAction<boolean>) => {
			state.isToastsShown = action.payload;
		},
	},
});

export const {
	setDenom,
	setFirstLoad,
	setIsToastsShown,
	setOnlyWeblnIfEnabled,
	setPersistSettings,
	setWeblnAutoWithdraw,
} = settingsSlice.actions;
export default settingsSlice.reducer;
