import React, { ReactNode } from 'react';

import { WrapBaseDialog } from 'components/dialogs/base';
import { ContractInfoDialog } from 'components/dialogs/ContractInfo';
import { LoginDialog } from 'components/dialogs/Login';
import { QuantityTouchInputDialog } from 'components/dialogs/QuantityTouchInput';
import { SettingsDialog } from 'components/dialogs/Settings';
import { WithdrawAvailableDialog } from 'components/dialogs/WithdrawAvailable';
import { DIALOGS } from 'consts';
import { setDialogClose } from 'contexts/modules/layout';
import { useAppDispatch, useAppSelector } from 'hooks';
import { EditTpslDialog } from './EditTpsl';

// Add dialogs that don't really situate in a particular component here
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
			<WrapBaseDialog isOpen={currentDialog === DIALOGS.CONTRACT_INFO} close={close}>
				<ContractInfoDialog />
			</WrapBaseDialog>
			<WrapBaseDialog isOpen={currentDialog === DIALOGS.QUANTITY_TOUCH_INPUT} close={close}>
				<QuantityTouchInputDialog />
			</WrapBaseDialog>
		</>
	);
};

// Used to add dialogs directly to a component. Usually confirmation related that need to pass props
export const DialogWrapper = ({ children, dialogType }: { children: ReactNode; dialogType: DIALOGS }) => {
	const dispatch = useAppDispatch();
	const currentDialog = useAppSelector(state => state.layout.dialog);
	const close = React.useCallback(() => dispatch(setDialogClose()), []);
	return (
		<WrapBaseDialog isOpen={currentDialog === dialogType} close={close}>
			{children}
		</WrapBaseDialog>
	);
};
