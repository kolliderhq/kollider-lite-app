import React from 'react';

import { LoginDialog } from 'components/dialogs/Login';
import { SettingsDialog } from 'components/dialogs/Settings';
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
			<LoginDialog isOpen={currentDialog === DIALOGS.LOGIN} close={close} />
			<SettingsDialog isOpen={currentDialog === DIALOGS.SETTINGS} close={close} />
			<WithdrawAvailableDialog isOpen={currentDialog === DIALOGS.SETTLE_INVOICE} close={close} />
		</>
	);
};
