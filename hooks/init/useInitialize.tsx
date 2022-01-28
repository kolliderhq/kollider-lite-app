import React from 'react';

import empty from 'is-empty';

import { auth } from 'classes/Auth';
import { POPUPS } from 'consts';
import { defaultLocalStore, storeDispatch } from 'contexts';
import { setPopup } from 'contexts/modules/layout';
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
	console.log('settings >>>>>>> ', settings);
	if (empty(settings)) {
		storeDispatch(setPopup(POPUPS.WELCOME));
		storeDispatch(setFirstLoad());
	} else {
		storeDispatch(setPersistSettings(settings));
		if (settings.isFirstRun) {
			storeDispatch(setPopup(POPUPS.WELCOME));
			storeDispatch(setFirstLoad());
		}
	}
};
