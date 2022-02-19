import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { DIALOGS, POPUPS, TABS, TABLE_TABS } from 'consts';

interface InitLayout {
	dialog: DIALOGS;
	popup: POPUPS;
	selectedTab: TABS;
	selectedTableTab: TABLE_TABS,
	editingLeverage: boolean;
	isMaintenance: boolean;
}

const initialState: InitLayout = {
	dialog: DIALOGS.NONE,
	popup: POPUPS.NONE,
	selectedTab: TABS.ORDER,
	selectedTableTab: TABLE_TABS.POSITIONS,
	editingLeverage: false,
	isMaintenance: false,
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

		setTableTab: (state, action: PayloadAction<TABLE_TABS>) => {
			state.selectedTableTab = action.payload
		},

		setEditLeverage: (state, action: PayloadAction<boolean>) => {
			state.editingLeverage = action.payload;
		},
		setIsMaintenance: (state, action: PayloadAction<boolean>) => {
			state.isMaintenance = action.payload
		}
	},
});

export const { setDialog, setDialogClose, setPopup, setTab, setPopupClose, setEditLeverage, setTableTab, setIsMaintenance } = layoutSlice.actions;

export default layoutSlice.reducer;
