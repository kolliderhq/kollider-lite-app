import React from 'react';

import empty from 'is-empty';

import { auth } from 'classes/Auth';
import { DIALOGS } from 'consts';
import { defaultLocalStore, storeDispatch } from 'contexts';
import { setDialog } from 'contexts/modules/layout';
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
	if (empty(settings)) {
		storeDispatch(setDialog(DIALOGS.WELCOME));
		storeDispatch(setFirstLoad());
	} else {
		storeDispatch(setPersistSettings(settings));
		if (settings.isFirstRun) {
			storeDispatch(setDialog(DIALOGS.WELCOME));
			storeDispatch(setFirstLoad());
		}
	}
};
