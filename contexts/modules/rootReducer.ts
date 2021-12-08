import { combineReducers } from '@reduxjs/toolkit';

import connectionReducers from './connection';
import invoicesReducers from './invoices';
import miscReducers from './misc';
import notificationsReducers from './notifications';
import ordersReducers from './orders';
import symbolsReducers from './symbols';
import userReducers from './user';

const rootReducer = combineReducers({
	symbols: symbolsReducers,
	orders: ordersReducers,
	connection: connectionReducers,
	invoices: invoicesReducers,
	misc: miscReducers,
	user: userReducers,
	notifications: notificationsReducers,
});

export default rootReducer;
export type RootState = ReturnType<typeof rootReducer>;
