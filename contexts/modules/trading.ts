import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import cloneDeep from 'lodash-es/cloneDeep';
import each from 'lodash-es/each';

import { Balances, PositionState, ReceivedOrder } from 'utils/refiners/sockets';
import { OrderTemplate } from 'utils/trading';

interface InitState {
	positions: Record<string, Partial<PositionState> & { quantity: string }>;
	balances: Balances;
	instantOrders: Record<string, Record<string, Partial<OrderTemplate & { extOrderId: string }>>>;
	orderIds: Record<string, Record<string, Partial<ReceivedOrder>>>;
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
	instantOrders: {},
	orderIds: {},
};

export const tradingSlice = createSlice({
	name: 'trading',
	initialState,
	reducers: {
		setInitTrading: (state, action: PayloadAction<string[]>) => {
			each(action.payload, symbol => {
				state.positions[symbol] = { quantity: '0' };
			});
			state.balances = cloneDeep(initialState.balances);
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
		setOrderId: (state, action: PayloadAction<ReceivedOrder>) => {
			const { symbol, orderId } = action.payload;
			if (state.orderIds[symbol] === undefined) state.orderIds[symbol] = {};
			state.orderIds[symbol][orderId] = action.payload;
		},
		setInstantOrder: (state, action: PayloadAction<{ order: OrderTemplate; extOrderId: string }>) => {
			const { order, extOrderId } = action.payload;
			if (!state.instantOrders[order.symbol]) state.instantOrders[order.symbol] = {};
			state.instantOrders[order.symbol][extOrderId] = order;
		},
		mergeInstantOrder: (state, action: PayloadAction<ReceivedOrder>) => {
			const order = action.payload;
			const newOrder = {
				leverage: order.leverage,
				quantity: String(order.quantity),
				price: String(order.price),
				symbol: order.symbol,
				extOrderId: order.extOrderId,
			} as Partial<OrderTemplate & { extOrderId: string }>;
			if (!state.instantOrders[order.symbol]) {
				state.instantOrders[order.symbol] = {
					[order.extOrderId]: newOrder,
				};
			} else if (state.instantOrders[order.symbol][order.extOrderId]) {
				state.instantOrders[order.symbol][order.extOrderId] = {
					...state.instantOrders[order.symbol][order.extOrderId],
					...newOrder,
				};
			} else {
				state.instantOrders[order.symbol][order.extOrderId] = newOrder;
			}
		},
	},
});

export const {
	setInitTrading,
	setOrderId,
	setPositionClosed,
	setPositionsData,
	setBalances,
	setInstantOrder,
	mergeInstantOrder,
} = tradingSlice.actions;
export default tradingSlice.reducer;
