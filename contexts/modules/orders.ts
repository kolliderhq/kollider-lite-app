import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import cloneDeep from 'lodash-es/cloneDeep';
import toString from 'lodash-es/toString';

import { optionalDecimal } from 'utils/format';

export enum Side {
	BID = 'Bid',
	ASK = 'Ask',
}

export interface Order {
	quantity: string;
	leverage: number;
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
		quantity: '', //	 deliberate undefined. null gets turned into a 0.
		leverage: 1,
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
			//	only undefined seems to empty it
			if (action.payload === '') {
				state.order.quantity = '';
				return;
			}
			// last input is a decimal dot
			if (action.payload.charAt(action.payload.length - 1) === '.' && !isNaN(Number(action.payload.slice(0, -1)))) {
				state.order.quantity = action.payload;
				return;
			}
			state.order.quantity = isNaN(Number(action.payload)) ? undefined : action.payload;
		},
		setOrderLeverage: (state, action: PayloadAction<number>) => {
			state.order.leverage = Number(optionalDecimal(toString(action.payload)));
		},
	},
});

export const { reinitOrder, setOrderLeverage, setOrderQuantity, setOrderInputError } = ordersSlice.actions;

export default ordersSlice.reducer;
