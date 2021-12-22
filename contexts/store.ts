import { configureStore } from '@reduxjs/toolkit';
import includes from 'lodash-es/includes';

import { persistMiddleware } from 'contexts/middleware/persist-middleware';

import rootReducer from './modules/rootReducer';

let reduxStore: any;
if (process.env.NODE_ENV !== 'production') {
	const { createLogger } = require('redux-logger');
	if (Number(process.env.NEXT_PUBLIC_DEBUG_MODE) <= 1) {
		const logger = createLogger({
			collapsed: true,
			diff: true,
			predicate: (getState, action) =>
				!includes(
					[
						'api/isOnline',
						'trading/updateLastGraphData',
						'orderbook/processOrder',
						'prices/setIndexes',
						'prices/setMarkPrices',
						'orders/setOrderLeverage',
					],
					action.type
				),
		});
		reduxStore = configureStore({
			reducer: rootReducer,
			middleware: getDefaultMiddleware => getDefaultMiddleware().concat(logger, persistMiddleware),
		});
	} else {
		reduxStore = configureStore({
			reducer: rootReducer,
			middleware: getDefaultMiddleware => getDefaultMiddleware().concat(persistMiddleware),
		});
	}
} else {
	reduxStore = configureStore({
		reducer: rootReducer,
		middleware: getDefaultMiddleware => getDefaultMiddleware().concat(persistMiddleware),
	});
}

export const storeDispatch = (...params: any[]) => reduxStore.dispatch(...params);
export { reduxStore };

export type RootState = ReturnType<typeof reduxStore.getState>;
export type AppDispatch = typeof reduxStore.dispatch;
