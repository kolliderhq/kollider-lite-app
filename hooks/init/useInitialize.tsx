import React from 'react';

import empty from 'is-empty';

import { baseSocketClient } from 'classes/SocketClient';
import { CHANNELS } from 'consts';
import { defaultLocalStore, setIsWsConnected, storeDispatch } from 'contexts';
import { setFirstLoad, setPersistSettings } from 'contexts/modules/settings';
import { useAppDispatch } from 'hooks/redux';
import { LOG3 } from 'utils/debug';

export function useInitialize() {
	const dispatch = useAppDispatch();

	React.useEffect(() => {
		const settings = defaultLocalStore.get('settings');
		if (empty(settings)) {
			dispatch(setFirstLoad());
		} else {
			dispatch(setPersistSettings(settings));
		}
		baseSocketClient.connect('', data => {
			baseSocketClient.requestChannelSubscribe(CHANNELS.POSITION_STATES, []);
			storeDispatch(setIsWsConnected(true));
		});
	}, []);
}
