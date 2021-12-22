import React from 'react';

import useSWR from 'swr';

import { baseSocketClient } from 'classes/SocketClient';
import { wrapBaseDialog } from 'components/dialogs/base';
import Loader from 'components/Loader';
import { QrCode } from 'components/QrCode';
import { wrapHasLightClient } from 'components/wrappers/LightClientWrapper';
import { API_NAMES, CONTEXTS, DIALOGS, USER_TYPE, WS_CUSTOM_TYPES } from 'consts';
import { defaultLocalStore, setApiKey, setUserData } from 'contexts';
import { setDialog } from 'contexts/modules/layout';
import { useAppDispatch, useAppSelector } from 'hooks';
import { getSWROptions } from 'utils/fetchers';

export const Login = () => {
	const [open, setOpen] = React.useState(true);
	const [loggedIn, isWeblnConnected] = useAppSelector(state => [
		state.user.data.token !== '',
		state.connection.isWeblnConnected,
	]);
	return <LoginDialog isOpen={!loggedIn && open && !isWeblnConnected} close={() => setOpen(false)} />;
};

export const LoginDialog = wrapBaseDialog(
	wrapHasLightClient(
		() => {
			return <LoginContents />;
		},
		() => (
			<div className="h-[364px]">
				<Loader />
			</div>
		)
	)
);

const LoginContents = () => {
	const dispatch = useAppDispatch();
	const [hasToken, isWeblnConnected] = useAppSelector(state => [
		state.connection.apiKey,
		state.connection.isWeblnConnected,
	]);
	const { data } = useSWR([API_NAMES.AUTH_LNURL, hasToken], getSWROptions(API_NAMES.AUTH_LNURL));

	React.useEffect(() => {
		const cleanup = baseSocketClient.listenOnce(WS_CUSTOM_TYPES.LNURL_AUTH_CREDENTIALS, data => {
			dispatch(setDialog(DIALOGS.NONE));
			dispatch(setApiKey(data.accessToken));
			const userData = {
				token: data?.accessToken,
				email: '',
				type: USER_TYPE.PRO,
			};
			// displayToast(<p className="text-sm">Successfully logged in</p>, 'info', {
			// 	autoClose: 1500,
			// 	position: 'top-center',
			// });
			dispatch(setUserData(userData));
			defaultLocalStore.cookieSet(CONTEXTS.LOCAL_STORAGE.FULL_USER, { ...userData });
			if (data?.refreshToken) defaultLocalStore.cookieSet(CONTEXTS.LOCAL_STORAGE.FULL_USER_REFRESH, data.refreshToken);
		});
		return () => {
			cleanup();
		};
	}, [dispatch]);

	return (
		<div className="w-full h-full my-auto">
			{!data?.lnurlAuth ? (
				<div className="h-[364px]">
					<Loader />
				</div>
			) : (
				<div className="flex flex-col items-center">
					<h2 className="tracking-wider mb-3">
						<img className="inline mr-2 pb-1" width={28} height={28} src="/assets/common/lightning.svg" />
						Login
					</h2>
					<p className="my-2 text-gray-300 text-sm mx-auto w-fit px-5 py-2 bg-gray-700 rounded-lg border border-gray-400">
						Scan with your wallet to log in
					</p>
					<div className="border-white border-8 mt-2 rounded-lg">
						<div className="border-black border-4 s-qrWrapper">
							<div className="border-white border-8">
								<QrCode autoClick={isWeblnConnected} wrapperClass="" size={280} value={data.lnurlAuth} />
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
