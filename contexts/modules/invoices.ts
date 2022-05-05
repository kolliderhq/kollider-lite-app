import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import each from 'lodash-es/each';
import toPlainObject from 'lodash-es/toPlainObject';

import { OrderInvoice } from 'utils/refiners/sockets';
import { Nullable } from 'utils/types/utils';

export type Settlement = Record<string, unknown>;

interface InitState {
	viewing: boolean;
	settlement: Nullable<Settlement>;
	invoices: Record<string, Partial<OrderInvoice>>;
	symbol: string; //	last symbol used
	numberWithdrawalsRejected: number,
}

const initialState: InitState = {
	viewing: false,
	settlement: null,
	invoices: {},
	symbol: '',
	numberWithdrawalsRejected: 0,
};

export const invoicesSlice = createSlice({
	name: 'invoices',
	initialState,
	reducers: {
		setInitSymbols: (state, action: PayloadAction<string[]>) => {
			each(action.payload, v => {
				state.invoices[v] = {};
			});
		},
		setViewing: (state, action: PayloadAction<boolean>) => {
			state.viewing = action.payload;
		},
		setSettlement: (state, action: PayloadAction<Settlement>) => {
			state.settlement = action.payload;
		},
		setInvoiceSettled: (state, action: PayloadAction<string>) => {
			state.invoices[action.payload] = {};
			state.viewing = false;
		},
		setNewInvoice: (state, action: PayloadAction<OrderInvoice & { extOrderId: string }>) => {
			state.invoices[action.payload.symbol] = action.payload;
			state.invoices = { ...toPlainObject(state.invoices), [action.payload.symbol]: action.payload };
			state.symbol = action.payload.symbol;
			state.viewing = true;
		},
		setNumberWithdrawalsRejected: (state, action: PayloadAction<number>) => {
			state.numberWithdrawalsRejected = action.payload
		}
	},
});

export const { setInitSymbols, setInvoiceSettled, setSettlement, setViewing, setNewInvoice, setNumberWithdrawalsRejected } = invoicesSlice.actions;

export default invoicesSlice.reducer;
