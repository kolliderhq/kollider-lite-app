import React from 'react';

import empty from 'is-empty';

import { auth } from 'classes/Auth';
import { defaultLocalStore, storeDispatch } from 'contexts';
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
	console.log('settings', settings);
	if (empty(settings)) {
		storeDispatch(setFirstLoad());
	} else {
		storeDispatch(setPersistSettings(settings));
	}
};
