import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import cloneDeep from 'lodash-es/cloneDeep';

import { optionalDecimal } from 'utils/format';

export enum Side {
	BID = 'Bid',
	ASK = 'Ask',
}

export interface Order {
	quantity: string;
	leverage: string;
	isInstant: boolean;
}

// TODO : use this to specify where in the UI there are errors
export enum InputError {
	NONE = '',
	QUANTITY = 'Quantity',
	LEVERAGE = 'Leverage',
}

interface InitState {
	inputError: InputError;
	order: Order;
}

const initialState: InitState = {
	inputError: InputError.NONE,
	order: {
		quantity: '',
		leverage: '1',
		isInstant: true,
	},
};

export const ordersSlice = createSlice({
	name: 'orders',
	initialState,
	reducers: {
		setOrderInputError: (state, action: PayloadAction<InputError>) => {
			state.inputError = action.payload;
		},

		//	order
		reinitOrder: state => {
			const pojoState = cloneDeep(state);
			console.log('reinit order', pojoState, initialState);
			state.order = { ...initialState.order, leverage: pojoState.order.leverage };
		},
		setOrderQuantity: (state, action: PayloadAction<string>) => {
			state.order.quantity = action.payload;
		},
		setOrderLeverage: (state, action: PayloadAction<string>) => {
			state.order.leverage = optionalDecimal(action.payload);
		},
		toggleOrderInstant: state => {
			const pojoState = cloneDeep(state);
			state.order.isInstant = !pojoState.order.isInstant;
		},
	},
});

export const { reinitOrder, setOrderLeverage, setOrderQuantity, setOrderInputError, toggleOrderInstant } =
	ordersSlice.actions;

export default ordersSlice.reducer;
