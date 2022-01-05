import React, { FunctionComponent, ReactNode } from 'react';

import { auth } from 'classes/Auth';
import Loader from 'components/Loader';
import { USER_TYPE } from 'consts';
import { useAppSelector } from 'hooks';

interface WrapHasLightClientProps {
	loaderElement?: ReactNode;
}
export const WrapHasLightClient: FunctionComponent<WrapHasLightClientProps> = ({ children, loaderElement }) => {
	const userType = useAppSelector(state => state.user.data.type);
	React.useEffect(() => {
		if (userType !== USER_TYPE.NULL) return;
		console.log('lightclient login');
		auth.lightClientLogin();
	}, [userType]);
	const loader = loaderElement ? loaderElement : <Loader />;
	return <>{userType !== USER_TYPE.NULL ? children : loader}</>;
};
