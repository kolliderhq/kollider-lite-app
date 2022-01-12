import React from 'react';

import { WrapBaseDialog } from 'components/dialogs/base';
import { LoginDialog } from 'components/dialogs/Login';
import { SettingsDialog } from 'components/dialogs/Settings';
import { WelcomeDialog } from 'components/dialogs/Welcome';
import { WithdrawAvailableDialog } from 'components/dialogs/WithdrawAvailable';
import { DIALOGS } from 'consts';
import { setDialogClose } from 'contexts/modules/layout';
import { useAppDispatch, useAppSelector } from 'hooks';

export const Dialogs = () => {
	const dispatch = useAppDispatch();
	const currentDialog = useAppSelector(state => state.layout.dialog);
	const close = React.useCallback(() => dispatch(setDialogClose()), []);
	return (
		<>
			<WrapBaseDialog isOpen={currentDialog === DIALOGS.LOGIN} close={close}>
				<LoginDialog />
			</WrapBaseDialog>
			<WrapBaseDialog isOpen={currentDialog === DIALOGS.SETTINGS} close={close}>
				<SettingsDialog />
			</WrapBaseDialog>
			<WrapBaseDialog isOpen={currentDialog === DIALOGS.SETTLE_INVOICE} close={close}>
				<WithdrawAvailableDialog />
			</WrapBaseDialog>
			<WrapBaseDialog isOpen={currentDialog === DIALOGS.WELCOME} close={close}>
				<WelcomeDialog />
			</WrapBaseDialog>
		</>
	);
};
