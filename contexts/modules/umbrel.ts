import { PayloadAction, createSlice } from '@reduxjs/toolkit';
export interface Umbrel {
	balanceId: number;
}

const initialState: Umbrel = {
	balanceId: 0,
};

export const umbrelSlice = createSlice({
	name: 'umbrel',
	initialState,
	reducers: {
		increaseBalanceId: state => {
			state.balanceId += 1;
		},
	},
});

export const { increaseBalanceId } = umbrelSlice.actions;
export default umbrelSlice.reducer;
