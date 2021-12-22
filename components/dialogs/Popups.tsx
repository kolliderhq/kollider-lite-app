import React from 'react';

import { InvoicePopup } from 'components/dialogs/Invoice';
import { DIALOGS, POPUPS } from 'consts';
import { setDialog, setPopupClose } from 'contexts/modules/layout';
import { useAppDispatch, useAppSelector } from 'hooks';

export const Popups = () => {
	const dispatch = useAppDispatch();
	const currentPopup = useAppSelector(state => state.layout.popup);
	const close = React.useCallback(() => dispatch(setPopupClose()), []);

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
