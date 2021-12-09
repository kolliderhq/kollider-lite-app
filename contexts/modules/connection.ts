import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import type { WebLNProvider } from 'webln';

import { Nullable } from 'utils/types/utils';

interface ConnectionState {
	apiKey: string;
	isOnline: boolean;
	serviceStatus: {
		status: string;
		msg: string;
	};
	isWsConnected: boolean;
	isWsAuthenticated: boolean;

	isWeblnConnected: Nullable<boolean>;
	webln: Nullable<WebLNProvider>;
}

const initialState: ConnectionState = {
	apiKey: '',
	isOnline: false,

	serviceStatus: {
		status: 'NotRunning',
		msg: 'Under Maintenance',
	},
	isWsConnected: false,
	isWsAuthenticated: false,

	isWeblnConnected: null,
	webln: null,
};

export const connectionSlice = createSlice({
	name: 'connection',
	initialState,
	reducers: {
		setIsOnline: (state, action: PayloadAction<boolean>) => {
			state.isOnline = action.payload;
		},
		setApiKey: (state, action: PayloadAction<string>) => {
			axios.defaults.headers.common['Authorization'] = action.payload;
			state.apiKey = action.payload;
		},
		setIsWsConnected: (state, action: PayloadAction<boolean>) => {
			state.isWsConnected = action.payload;
			if (action.payload === false) {
				state.isWsAuthenticated = false;
			}
		},
		setIsWsAuthenticated: (state, action: PayloadAction<boolean>) => {
			state.isWsAuthenticated = action.payload;
		},
		setWebln: (state, action: PayloadAction<WebLNProvider>) => {
			state.webln = action.payload;
			state.isWeblnConnected = true;
		},
		setWeblnFailed: state => {
			state.isWeblnConnected = false;
		},
	},
});

export const { setIsOnline, setApiKey, setIsWsConnected, setIsWsAuthenticated, setWebln } = connectionSlice.actions;

export default connectionSlice.reducer;
