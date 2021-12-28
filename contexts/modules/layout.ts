import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { DIALOGS, POPUPS, TABS } from 'consts';

interface InitLayout {
	dialog: DIALOGS;
	popup: POPUPS;
	selectedTab: TABS;

	editingLeverage: boolean;
}

const initialState: InitLayout = {
	dialog: DIALOGS.NONE,
	popup: POPUPS.NONE,
	selectedTab: TABS.ORDER,

	editingLeverage: false,
};

export const layoutSlice = createSlice({
	name: 'layout',
	initialState,
	reducers: {
		setDialog: (state, action: PayloadAction<DIALOGS>) => {
			state.dialog = action.payload;
		},
		setDialogClose: state => {
			state.dialog = DIALOGS.NONE;
		},

		setPopup: (state, action: PayloadAction<POPUPS>) => {
			state.popup = action.payload;
		},
		setPopupClose: state => {
			state.popup = POPUPS.NONE;
		},

		setTab: (state, action: PayloadAction<TABS>) => {
			state.selectedTab = action.payload;
		},

		setEditLeverage: (state, action: PayloadAction<boolean>) => {
			state.editingLeverage = action.payload;
		},
	},
});

export const { setDialog, setDialogClose, setPopup, setTab, setPopupClose, setEditLeverage } = layoutSlice.actions;

export default layoutSlice.reducer;
