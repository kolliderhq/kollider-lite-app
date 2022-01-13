import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import each from 'lodash-es/each';

import { Balances, IndexValues, PositionState } from 'utils/refiners/sockets';

interface InitState {
	indexes: Record<string, number>;
	markPrices: Record<string, string>;
	fundingRates: Record<string, string>;
}

const initialState: InitState = {
	indexes: {
		['BTCUSD']: NaN,
	},
	markPrices: {
		['BTCUSD.PERP']: '',
	},
	fundingRates: {
		['BTCUSD.PERP']: '',
	},
};

export const pricesSlice = createSlice({
	name: 'prices',
	initialState,
	reducers: {
		setInitPrices: (state, action: PayloadAction<string[]>) => {
			each(action.payload, symbol => {
				state.markPrices[symbol] = '';
				state.indexes[symbol] = NaN;
			});
		},
		setIndexes: (state, action: PayloadAction<{ symbol: string; value: number }>) => {
			state.indexes[action.payload.symbol] = action.payload.value;
		},
		setMarkPrices: (state, action: PayloadAction<{ symbol: string; value: string }>) => {
			state.markPrices[action.payload.symbol] = action.payload.value;
		},
		setFundingRates: (state, action: PayloadAction<{ symbol: string; rate: string }>) => {
			state.fundingRates[action.payload.symbol] = action.payload.rate;
		},
	},
});

export const { setInitPrices, setIndexes, setMarkPrices, setFundingRates } = pricesSlice.actions;
export default pricesSlice.reducer;
