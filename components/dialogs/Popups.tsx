import React from 'react';

import { InvoicePopup } from 'components/dialogs/Invoice';
import { DIALOGS, POPUPS } from 'consts';
import { setInvoiceSettled, setViewing } from 'contexts';
import { setDialog, setPopup, setPopupClose } from 'contexts/modules/layout';
import { useAppDispatch, useAppSelector } from 'hooks';

export const Popups = () => {
	const dispatch = useAppDispatch();
	const [currentPopup, { onlyWeblnIfEnabled }, invoiceViewing, isWeblnConnected] = useAppSelector(state => [
		state.layout.popup,
		state.settings,
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
		if (onlyWeblnIfEnabled && isWeblnConnected) return;
		if (invoiceViewing) {
			dispatch(setPopup(POPUPS.INVOICE));
		} else {
			dispatch(setPopup(POPUPS.NONE));
		}
	}, [onlyWeblnIfEnabled, invoiceViewing, isWeblnConnected]);

	//	close dialog if popup
	React.useEffect(() => {
		if (currentPopup === POPUPS.NONE) return;
		dispatch(setDialog(DIALOGS.NONE));
	}, [currentPopup]);

	return (
		<>
			<InvoicePopup isOpen={currentPopup === POPUPS.INVOICE} close={close} />
		</>
	);
};
