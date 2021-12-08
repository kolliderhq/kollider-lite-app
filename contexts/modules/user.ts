import { GENERAL } from 'constants/misc/general';
import { USER_TYPES } from 'constants/user';

import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { WithdrawalLimitInfo } from 'utils/refiners/sockets';

interface IUserState {
	data: {
		email: string;
		token: string;
		type: USER_TYPES;
	};
	logout: boolean;
	withdrawLimits?: WithdrawalLimitInfo;
}
const initialState: IUserState = {
	data: {
		email: '',
		token: '',
		type: GENERAL.USER_TYPES.NULL,
	},
	logout: false,
	withdrawLimits: null,
};

export const userSlice = createSlice({
	name: 'user',
	initialState,
	reducers: {
		setUserData: (state, action: PayloadAction<{ email: string; token: string; type: USER_TYPES }>) => {
			state.data = action.payload;
			state.logout = false;
		},
		setUserType: (state, action: PayloadAction<USER_TYPES>) => {
			state.data.type = action.payload;
		},
		setUserEmail: (state, action: PayloadAction<string>) => {
			state.data.email = action.payload;
		},
		setUserLogout: state => {
			state.data = { ...initialState.data };
			state.logout = true;
		},
		setUserWithdrawlLimits: (state, action: PayloadAction<WithdrawalLimitInfo>) => {
			state.withdrawLimits = action.payload;
		},
	},
});

export const { setUserData, setUserEmail, setUserLogout, setUserType, setUserWithdrawlLimits } = userSlice.actions;

export default userSlice.reducer;
