import React from 'react';

import noop from 'lodash-es/noop';

import { WrapBasePopup } from 'components/dialogs/base';
import { InvoicePopup } from 'components/dialogs/Invoice';
import { UmbrelPWPopup } from 'components/dialogs/UmbrelPW';
import { WelcomePopup } from 'components/dialogs/Welcome';
import { DIALOGS, POPUPS } from 'consts';
import { setViewing } from 'contexts';
import { setDialog, setPopup, setPopupClose } from 'contexts/modules/layout';
import { useAppDispatch, useAppSelector } from 'hooks';

export const Popups = () => {
	const dispatch = useAppDispatch();
	const [currentPopup, onlyWeblnIfEnabled, invoiceViewing, isWeblnConnected] = useAppSelector(state => [
		state.layout.popup,
		state.settings.onlyWeblnIfEnabled || process.env.NEXT_PUBLIC_UMBREL === '1',
		state.invoices.viewing,
		state.connection.isWeblnConnected,
	]);
	const close = React.useCallback(() => {
		dispatch(setPopupClose());
		if (currentPopup === POPUPS.INVOICE) {
			dispatch(setViewing(false));
		}
	}, [currentPopup]);

	//	open invoice popup
	React.useEffect(() => {
		if ((onlyWeblnIfEnabled && isWeblnConnected) || process.env.NEXT_PUBLIC_UMBREL === '1') return;
		if (invoiceViewing) {
			dispatch(setPopup(POPUPS.INVOICE));
		} else {
			if (currentPopup === POPUPS.WELCOME) return;
			dispatch(setPopupClose);
		}
	}, [onlyWeblnIfEnabled, invoiceViewing, isWeblnConnected]);

	//	close dialog if popup
	React.useEffect(() => {
		if (currentPopup === POPUPS.NONE) return;
		dispatch(setDialog(DIALOGS.NONE));
	}, [currentPopup]);

	// React.useEffect(() => {
	// 	dispatch(setPopup(POPUPS.WELCOME));
	// }, [currentPopup]);

	return (
		<>
			<WrapBasePopup isOpen={currentPopup === POPUPS.INVOICE} close={close}>
				<InvoicePopup />
			</WrapBasePopup>
			<WrapBasePopup isOpen={currentPopup === POPUPS.WELCOME} close={close}>
				<WelcomePopup />
			</WrapBasePopup>
			<WrapBasePopup isOpen={currentPopup === POPUPS.UMBREL_PW} close={noop} isHideCloseButton>
				<UmbrelPWPopup />
			</WrapBasePopup>
		</>
	);
};
