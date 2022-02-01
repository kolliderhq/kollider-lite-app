import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import each from 'lodash-es/each';
import toPlainObject from 'lodash-es/toPlainObject';

interface InitState {
	paymentInTransit: boolean;
	withdrawalPending: boolean;
}

const initialState: InitState = {
	paymentInTransit: false,
	withdrawalPending: false,
};

export const paymentsSlice = createSlice({
	name: 'payments',
	initialState,
	reducers: {
		setPaymentInTransit: (state, action: PayloadAction<boolean>) => {
			state.paymentInTransit = action.payload;
		},
		setWithdrawalPending: (state, action: PayloadAction<boolean>) => {
			state.withdrawalPending = action.payload;
		},
	},
});

export const { setPaymentInTransit, setWithdrawalPending } = paymentsSlice.actions;

export default paymentsSlice.reducer;
