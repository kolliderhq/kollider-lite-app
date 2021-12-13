import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import each from 'lodash-es/each';

import { Balances, IndexValues, PositionState } from 'utils/refiners/sockets';

interface InitState {
	indexes: Record<string, number>;
	markPrices: Record<string, string>;
}

const initialState: InitState = {
	indexes: {
		['BTCUSD.PERP']: NaN,
	},
	markPrices: {
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
	},
});

export const { setInitPrices, setIndexes, setMarkPrices } = pricesSlice.actions;
export default pricesSlice.reducer;
