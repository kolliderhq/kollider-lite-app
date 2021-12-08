// import React from 'react';
//
// import { API_NAMES } from 'constants/api';
// import { CONTEXTS } from 'constants/contexts';
// import { MISC } from 'constants/misc';
//
// import useSWR from 'swr';
//
// import { defaultLocalStore } from 'contexts/localStore';
// import { setIsBetaTesting, setIsOnline } from 'contexts/modules/api';
// import { setIsRunning, setMaintenance } from 'contexts/modules/layout';
// import { useAppDispatch } from 'hooks/redux';
// import { LOG5 } from 'utils/debug';
// import { getSWROptions, simpleFetch } from 'utils/fetchers';
// import { formatExactDate, getMsFromNow } from 'utils/time';
//
// export default function useStatusChecker() {
// 	const dispatch = useAppDispatch();
// 	const { data, error } = useSWR([API_NAMES.STATUS], getSWROptions(API_NAMES.STATUS));
// 	const [nextMaintenance, status, msg] = [data?.nextMaintenance, data?.status, data?.msg];
//
// 	const { data: versionData } = useSWR([API_NAMES.CHECK_VERSION], simpleFetch, getSWROptions(API_NAMES.CHECK_VERSION));
//
// 	React.useEffect(() => {
// 		if (!nextMaintenance || !status || status === 'Maintenance') return;
// 		const localValue = defaultLocalStore.get(CONTEXTS.LOCAL_STORAGE.HIDE_MAINTENANCE);
// 		if (localValue && getMsFromNow(localValue) < 0) return;
// 		displayToast(
// 			`${formatExactDate(nextMaintenance)}`,
// 			'warn',
// 			{
// 				autoClose: false,
// 				position: 'top-center',
// 			},
// 			'Maintenance Alert',
// 			true
// 		);
// 	}, [nextMaintenance, status]);
//
// 	React.useEffect(() => {
// 		if (!versionData) return;
// 		if (versionData.version === MISC.FRONT_VER) return;
// 		window.alert('New version detected - page will refresh');
// 		window.location.reload();
// 	}, [versionData]);
//
// 	const [running, setRunning] = React.useState(null);
//
// 	//  refresh site if server reconnects
// 	React.useEffect(() => {
// 		if (status) {
// 			if (status === 'Running') {
// 				dispatch(setMaintenance(false));
// 				setRunning(true);
// 				dispatch(setIsOnline(true));
// 			} else if (status === 'BetaTesting') {
// 				setRunning(true);
// 				dispatch(setIsOnline(true));
// 				dispatch(setIsBetaTesting(true));
// 				dispatch(setMaintenance(false));
// 			} else if (status === 'ViewOnly') {
// 				dispatch(setMaintenance(false));
// 				displayToast('Kollider is in ViewOnly Mode', 'info');
// 				dispatch(setIsOnline(false));
// 			} else {
// 				dispatch(setIsOnline(false));
// 				setRunning(false);
// 				if (status === 'NotRunning') {
// 					displayToast(msg, 'info');
// 				} else if (status === 'Maintenance') {
// 					dispatch(setMaintenance(true));
// 					displayToast(msg, 'info');
// 				} else {
// 					displayToast(`Kollider is in ${data} Mode`, 'info');
// 					console.warn(msg, data);
// 				}
// 			}
// 		} else if (error) {
// 			setRunning(false);
// 			displayToast(`Server is offline`, 'error', { position: 'top-right' }, 'Critical Error');
// 			LOG5('Server status offline', 'Critical Error');
// 		}
// 	}, [status, msg, error, dispatch]);
//
// 	React.useEffect(() => {
// 		if (running === null) return;
// 		dispatch(setIsRunning(running));
// 	}, [running, dispatch]);
// }
