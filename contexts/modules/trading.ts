import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import cloneDeep from 'lodash-es/cloneDeep';
import each from 'lodash-es/each';

import { Balances, PositionState, ReceivedOrder } from 'utils/refiners/sockets';
import { AdvancedOrderTemplate, OrderTemplate } from 'utils/trading';

interface InitState {
	positions: Record<string, Partial<PositionState> & { quantity: string }>;
	// for the position tab update dot
	positionChange: Record<string, number>;
	balances: Balances;
	instantOrders: Record<string, Record<string, Partial<OrderTemplate & { extOrderId: string }>>>;
	orderIds: Record<string, Record<string, Partial<ReceivedOrder>>>;
	advancedOrders: Record<number, AdvancedOrderTemplate>;
}

const initialState: InitState = {
	positions: {
		['BTCUSD.PERP']: {
			quantity: '0',
		},
	},
	positionChange: {
		['BTCUSD.PERP']: 0,
	},
	balances: {
		cash: {SAT: '0', KKP: '0'},
		crossMargin: '0',
		isolatedMargin: {},
		orderMargin: {},
	},
	advancedOrders: {},
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
			//	change only on quantity change
			if (state.positions[action.payload.symbol]?.quantity !== action.payload.data.quantity)
			state.positionChange = {
				...state.positionChange,
				[action.payload.symbol]: state.positionChange[action.payload.symbol] + 1,
			};
		},
		setPositionClosed: (state, action: PayloadAction<string>) => {
			state.positions[action.payload].quantity = '0';
		},
		setAdvancedOrder: (state, action: PayloadAction<{data: AdvancedOrderTemplate}>) => {
			state.advancedOrders = {...state.advancedOrders, [action.payload.data.orderId]: action.payload.data}
		},
		deleteAdvancedOrder: (state, action: PayloadAction<{orderId}>) => {
			// if (action.payload.advancedOrderType === 'TakeProfit') {
			// 	delete state.advancedOrders[action.payload.symbol].tp;
			// } else {
			// 	delete state.advancedOrders[action.payload.symbol].sl;
			// }
			let newState = {...state}
			delete newState.advancedOrders[action.payload.orderId];
			state = newState;
		},
		setBalances: (state, action: PayloadAction<Balances>) => {
			state.balances = { ...action.payload };
		},
		setOrderId: (state, action: PayloadAction<ReceivedOrder>) => {
			const { symbol, orderId } = action.payload;
			if (state.orderIds[symbol] === undefined) state.orderIds[symbol] = {};
			state.orderIds[symbol][orderId] = action.payload;
		},
		removeOrderId: (state, action: PayloadAction<string>) => {
			const orderId = action.payload;
			let found = false;
			each(Object.keys(state.orderIds), symbol => {
				if (found) return;
				if (state.orderIds[symbol][orderId]) {
					delete state.orderIds[symbol][orderId];
					found = true;
				}
			});
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
	removeOrderId,
	setPositionsData,
	setBalances,
	setInstantOrder,
	mergeInstantOrder,
	setAdvancedOrder,
	deleteAdvancedOrder,
} = tradingSlice.actions;
export default tradingSlice.reducer;
