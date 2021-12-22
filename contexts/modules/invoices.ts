import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import each from 'lodash-es/each';

import { OrderInvoice } from 'utils/refiners/sockets';
import { Nullable } from 'utils/types/utils';

export type Settlement = Record<string, unknown>;

interface InitState {
	viewing: boolean;
	settlement: Nullable<Settlement>;
	invoices: Record<string, OrderInvoice>;
	symbol: string; //	last symbol used
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
		setNewInvoice: (state, action: PayloadAction<OrderInvoice>) => {
			state.invoices[action.payload.symbol] = action.payload;
			state.symbol = action.payload.symbol;
		},
	},
});

export const { setInitSymbols, setInvoiceSettled, setSettlement, setViewing, setNewInvoice } = invoicesSlice.actions;

export default invoicesSlice.reducer;
