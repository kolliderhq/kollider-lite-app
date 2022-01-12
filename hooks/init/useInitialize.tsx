import React from 'react';

import empty from 'is-empty';

import { auth } from 'classes/Auth';
import { DIALOGS, POPUPS } from 'consts';
import { defaultLocalStore, storeDispatch } from 'contexts';
import { setDialog, setPopup } from 'contexts/modules/layout';
import { setFirstLoad, setPersistSettings } from 'contexts/modules/settings';

export function useInitialize() {
	React.useEffect(() => {
		persistSettings();
		auth.loadLocalData();
		auth.persistLogin();
	}, []);
}

const persistSettings = () => {
	const settings = defaultLocalStore.get('settings');
	//	first load display the welcome popup
	//  setTimeout used to prevent popup being closed by initialization code
	console.log('settings >>>>>>> ', settings);
	if (empty(settings)) {
		setTimeout(() => {
			storeDispatch(setPopup(POPUPS.WELCOME));
		}, 500);
		storeDispatch(setFirstLoad());
	} else {
		storeDispatch(setPersistSettings(settings));
		if (settings.isFirstRun) {
			setTimeout(() => {
				storeDispatch(setPopup(POPUPS.WELCOME));
			}, 500);
			storeDispatch(setFirstLoad());
		}
	}
};
