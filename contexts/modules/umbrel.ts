import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Umbrel {
	balanceId: number;
	localBalance: number;
	remoteBalance: number;
	confirmedBalance: number;
	unconfirmedBalance: number;
}

const initialState: Umbrel = {
	balanceId: 0,
	localBalance: 0,
	remoteBalance: 0,
	confirmedBalance: 0,
	unconfirmedBalance: 0,
};

export const umbrelSlice = createSlice({
	name: 'umbrel',
	initialState,
	reducers: {
		increaseBalanceId: state => {
			state.balanceId += 1;
		},
		setChannelBalances: (state, action: PayloadAction<{localBalance: number, remoteBalance: number}>) => {
			state.localBalance = action.payload.localBalance;
			state.remoteBalance = action.payload.remoteBalance;
		},
		setOnchainBalances: (state, action: PayloadAction<{confirmedBalance: number, unconfirmedBalance: number}>) => {
			state.confirmedBalance = action.payload.confirmedBalance;
			state.unconfirmedBalance = action.payload.unconfirmedBalance;
		}
	},
});

export const { increaseBalanceId, setChannelBalances, setOnchainBalances } = umbrelSlice.actions;
export default umbrelSlice.reducer;
