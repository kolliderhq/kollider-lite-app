import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { DIALOGS, POPUPS } from 'consts';

interface InitLayout {
	dialog: DIALOGS;
	popup: POPUPS;
}

const initialState: InitLayout = {
	dialog: DIALOGS.NONE,
	popup: POPUPS.NONE,
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
	},
});

export const { setDialog, setDialogClose, setPopup, setPopupClose } = layoutSlice.actions;

export default layoutSlice.reducer;
