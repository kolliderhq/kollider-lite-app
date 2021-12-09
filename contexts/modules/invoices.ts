import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import cloneDeep from 'lodash-es/cloneDeep';
import each from 'lodash-es/each';

import { Nullable } from '../../utils/types/utils';

export interface Settlement {
	a: boolean;
}

export interface InvoiceData {
	a: boolean;
}

interface InitState {
	viewing: boolean;
	settlement: Nullable<Settlement>;
	invoices: Record<string, Nullable<InvoiceData>>;
	symbol: String; //	last symbol used
}

const initialState: InitState = {
	viewing: false,
	settlement: null,
	invoices: {},
	symbol: '',
};

export const invoicesSlice = createSlice({
	name: 'invoices',
	initialState,
	reducers: {
		setInitSymbols: (state, action: PayloadAction<string[]>) => {
			each(action.payload, v => {
				state.invoices[v] = null;
			});
		},
		setViewing: (state, action: PayloadAction<boolean>) => {
			state.viewing = action.payload;
		},
		setSettlement: (state, action: PayloadAction<Settlement>) => {
			state.settlement = action.payload;
		},
		setInvoiceSettled: (state, action: PayloadAction<string>) => {
			state.invoices[action.payload] = null;
			state.viewing = false;
		},
	},
});

export const { setInitSymbols, setInvoiceSettled, setSettlement, setViewing } = invoicesSlice.actions;

export default invoicesSlice.reducer;
