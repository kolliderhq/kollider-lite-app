import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { auth } from 'classes/Auth';
import { USER_TYPE } from 'consts';
import { WithdrawalLimitInfo } from 'utils/refiners/sockets';

interface IUserState {
	data: {
		email: string;
		token: string;
		type: USER_TYPE;
	};
	logout: boolean;
	withdrawLimits?: WithdrawalLimitInfo;
}
const initialState: IUserState = {
	data: {
		email: '',
		token: '',
		type: USER_TYPE.NULL,
	},
	logout: false,
	withdrawLimits: null,
};

export const userSlice = createSlice({
	name: 'user',
	initialState,
	reducers: {
		setUserData: (state, action: PayloadAction<{ email: string; token: string; type: USER_TYPE }>) => {
			state.data = action.payload;
			auth.userType = action.payload.type;
			state.logout = false;
		},
		setUserType: (state, action: PayloadAction<USER_TYPE>) => {
			state.data.type = action.payload;
			auth.userType = action.payload;
		},
		setUserEmail: (state, action: PayloadAction<string>) => {
			state.data.email = action.payload;
		},
		setUserLogout: state => {
			state.data = { ...initialState.data };
			auth.userType = USER_TYPE.NULL;
			state.logout = true;
		},
		setUserWithdrawlLimits: (state, action: PayloadAction<WithdrawalLimitInfo>) => {
			state.withdrawLimits = action.payload;
		},
	},
});

export const { setUserData, setUserEmail, setUserLogout, setUserType, setUserWithdrawlLimits } = userSlice.actions;

export default userSlice.reducer;
