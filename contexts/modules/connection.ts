import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

import { Nullable } from 'utils/types/utils';
import type { WebLNProvider } from 'utils/vendor/webln';

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
	// webln is removed - instead it is re-requested each time it is used.z
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
		setWeblnConnected: (state, action: PayloadAction<boolean>) => {
			state.isWeblnConnected = action.payload;
		},
		setServiceStatus: (state, action: PayloadAction<{ status: string; msg: string }>) => {
			state.serviceStatus = action.payload;
		},
	},
});

export const { setIsOnline, setApiKey, setIsWsConnected, setIsWsAuthenticated, setWeblnConnected, setServiceStatus } =
	connectionSlice.actions;

export default connectionSlice.reducer;
