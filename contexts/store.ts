import { configureStore } from '@reduxjs/toolkit';
import includes from 'lodash-es/includes';

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
						'prices/setMarkprices',
					],
					action.type
				),
		});
		reduxStore = configureStore({
			reducer: rootReducer,
			middleware: getDefaultMiddleware => getDefaultMiddleware().concat(logger),
		});
	} else {
		reduxStore = configureStore({ reducer: rootReducer });
	}
} else {
	reduxStore = configureStore({ reducer: rootReducer });
}

export const storeDispatch = (...params: any[]) => reduxStore.dispatch(...params);
export default reduxStore as any;

export type RootState = ReturnType<typeof reduxStore.getState>;
export type AppDispatch = typeof reduxStore.dispatch;
