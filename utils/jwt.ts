import decode from 'jwt-decode';

import { LOG5 } from 'utils/debug';

export const jwtDecode = (jwt: string) => {
	try {
		return decode(jwt);
	} catch (ex) {
		LOG5(ex, 'jwt decode error');
		return {};
	}
};

export const jwtGetExp = (jwt: string) => {
	try {
		const decoded = decode(jwt) as any;
		return decoded?.exp;
	} catch (ex) {
		LOG5(ex, 'jwt decode error');
		return 0;
	}
};
