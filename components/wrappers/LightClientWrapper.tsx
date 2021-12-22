import React from 'react';

import { auth } from 'classes/Auth';
import Loader from 'components/Loader';
import { USER_TYPE } from 'consts';
import { useAppSelector } from 'hooks';

export function wrapHasLightClient<C extends React.ElementType, L extends React.ElementType>(
	element: C,
	loaderElement?: L
): React.ElementType<React.ComponentProps<C>> {
	return props => {
		const userType = useAppSelector(state => state.user.data.type);
		React.useEffect(() => {
			if (userType !== USER_TYPE.NULL) return;
			console.log('lightclient login');
			auth.lightClientLogin();
		}, [userType]);
		const loader = loaderElement ? React.createElement(loaderElement, props) : <Loader />;
		return userType !== USER_TYPE.NULL ? React.createElement(element, props) : loader;
	};
}
