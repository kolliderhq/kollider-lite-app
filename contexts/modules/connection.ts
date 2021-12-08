import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

import { Nullable } from '../../utils/types/utils';

export interface WeblnObj {
	a: boolean;
}

interface ConnectionState {
	apiKey: string;
	isOnline: boolean;
	serviceStatus: {
		status: string;
		msg: string;
	};
	isWsConnected: boolean;
	isWsAuthenticated: boolean;

	webln: Nullable<WeblnObj>;
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
		},
		setIsWsAuthenticated: (state, action: PayloadAction<boolean>) => {
			state.isWsAuthenticated = action.payload;
		},
		setWebln: (state, action: PayloadAction<WeblnObj>) => {
			state.webln = action.payload;
		},
	},
});

export const { setIsOnline, setApiKey, setIsWsConnected, setIsWsAuthenticated, setWebln } = connectionSlice.actions;

export default connectionSlice.reducer;
