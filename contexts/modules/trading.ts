import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import each from 'lodash-es/each';

import { Balances, PositionState } from 'utils/refiners/sockets';

interface InitState {
	positions: Record<string, Partial<PositionState> & { quantity: string }>;
	balances: Balances | {};
}

const initialState: InitState = {
	positions: {
		['BTCUSD.PERP']: {
			quantity: '0',
		},
	},
	balances: {
		cash: '0',
		crossMargin: '0',
		isolatedMargin: {},
		orderMargin: {},
	},
};

export const tradingSlice = createSlice({
	name: 'trading',
	initialState,
	reducers: {
		setInitPositions: (state, action: PayloadAction<string[]>) => {
			each(action.payload, symbol => (state.positions[symbol] = { quantity: '0' }));
		},
		setPositionsData: (state, action: PayloadAction<{ symbol: string; data: PositionState }>) => {
			state.positions[action.payload.symbol] = action.payload.data;
		},
		setPositionClosed: (state, action: PayloadAction<string>) => {
			state.positions[action.payload].quantity = '0';
		},
		setBalances: (state, action: PayloadAction<Balances>) => {
			state.balances = { ...action.payload };
		},
	},
});

export const { setInitPositions, setPositionClosed, setPositionsData } = tradingSlice.actions;
export default tradingSlice.reducer;
