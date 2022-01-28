import { PayloadAction, createSlice } from '@reduxjs/toolkit';

export interface Toast {
	a: boolean;
}

export interface ServerNotice {
	a: boolean;
}

interface InitState {
	toasts: Toast[];
	serverNotices: ServerNotice[]; //	not used atm
}

const initialState: InitState = {
	toasts: [],
	serverNotices: [],
};

export const notificationsSlice = createSlice({
	name: 'notifications',
	initialState,
	reducers: {
		setInitNotifications: state => {
			state.toasts.length = 0;
		},
		setAddNotification: (state, action: PayloadAction<Toast>) => {
			state.toasts.push(action.payload);
		},
	},
});

export const { setInitNotifications, setAddNotification } = notificationsSlice.actions;

export default notificationsSlice.reducer;
