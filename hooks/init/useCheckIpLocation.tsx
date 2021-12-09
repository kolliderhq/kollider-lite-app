import React from 'react';

import axios from 'axios';

import { RAW_GEOLOCATION } from 'consts/api';
import { setAllowedIp } from 'contexts/modules/misc';
import { useAppDispatch } from 'hooks/redux';

// import { displayToast } from 'utils/toast';

export const useCheckIpLocation = () => {
	const dispatch = useAppDispatch();
	React.useEffect(() => {
		getIpAllowed().then(res => {
			dispatch(setAllowedIp(res));
			if (!res) {
				// displayToast(
				// 	'Your IP address is from a restricted country, some actions are prohibited',
				// 	'warn',
				// 	{ autoClose: 15000, position: 'top-right' },
				// 	'Restricted IP'
				// );
			}
		});
	}, []);
};

const getIpAllowed = async () => {
	const res = await checkIp(); //	never throws;
	return res;
};

const checkIp = async () => {
	try {
		const { data } = await axios.get(RAW_GEOLOCATION);
		return !!data?.is_allowed;
	} catch (ex) {
		console.log('[checkIp] error');
		console.error(ex);
		// TODO : fallback method
		return true;
	}
};
