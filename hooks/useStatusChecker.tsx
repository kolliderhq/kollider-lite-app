import React from 'react';

import useSWR from 'swr';

import { API_NAMES, CONTEXTS } from 'consts';
import { defaultLocalStore, setIsOnline, setServiceStatus } from 'contexts';
import { useAppDispatch } from 'hooks/redux';
import { LOG5 } from 'utils/debug';
import { getSWROptions, simpleFetch } from 'utils/fetchers';
import { formatExactDate, getMsFromNow } from 'utils/time';

export function useStatusChecker() {
	const dispatch = useAppDispatch();
	const { data, error } = useSWR([API_NAMES.STATUS], getSWROptions(API_NAMES.STATUS));
	const [nextMaintenance, status, msg] = [data?.nextMaintenance, data?.status, data?.msg];

	const { data: versionData } = useSWR([API_NAMES.CHECK_VERSION], simpleFetch, getSWROptions(API_NAMES.CHECK_VERSION));

	React.useEffect(() => {
		if (!nextMaintenance || !status || status === 'Maintenance') return;
		const localValue = defaultLocalStore.get(CONTEXTS.LOCAL_STORAGE.HIDE_MAINTENANCE);
		if (localValue && getMsFromNow(localValue) < 0) return;
		// displayToast(
		// 	`${formatExactDate(nextMaintenance)}`,
		// 	'warn',
		// 	{
		// 		autoClose: false,
		// 		position: 'top-center',
		// 	},
		// 	'Maintenance Alert',
		// 	true
		// );
	}, [nextMaintenance, status]);

	const [running, setRunning] = React.useState(null);

	//  refresh site if server reconnects
	React.useEffect(() => {
		if (status) {
			dispatch(setServiceStatus({ status, msg }));
			if (status === 'Running') {
				setRunning(true);
				dispatch(setIsOnline(true));
			} else if (status === 'BetaTesting') {
				setRunning(true);
				dispatch(setIsOnline(true));
			} else if (status === 'ViewOnly') {
				// displayToast('Kollider is in ViewOnly Mode', 'info');
				dispatch(setIsOnline(false));
			} else {
				dispatch(setIsOnline(false));
				setRunning(false);
				// console.warn(msg, data);
			}
		} else if (error) {
			setRunning(false);
			// displayToast(`Server is offline`, 'error', { position: 'top-right' }, 'Critical Error');
			LOG5('Server status offline', 'Critical Error');
		}
	}, [status, msg, error, dispatch]);
}
