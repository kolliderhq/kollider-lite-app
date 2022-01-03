import React from 'react';

import useSWR from 'swr';

import { baseSocketClient } from 'classes/SocketClient';
import { wrapBaseDialog } from 'components/dialogs/base';
import Loader from 'components/Loader';
import { QrCode } from 'components/QrCode';
import { wrapHasLightClient } from 'components/wrappers/LightClientWrapper';
import { API_NAMES, CONTEXTS, DIALOGS, SETTINGS, USER_TYPE, WS_CUSTOM_TYPES } from 'consts';
import { defaultLocalStore, setApiKey, setUserData } from 'contexts';
import { setDialog } from 'contexts/modules/layout';
import { useAppDispatch, useAppSelector } from 'hooks';
import useTimer from 'hooks/useTimer';
import { getSWROptions } from 'utils/fetchers';
import { formatNumber } from 'utils/format';
import { TOAST_LEVEL, displayToast } from 'utils/toast';

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
	const [time] = useTimer(SETTINGS.LIMITS.INVOICE, () => dispatch(setDialog(DIALOGS.NONE)));
	const [hasToken, isWeblnConnected] = useAppSelector(state => [
		state.connection.apiKey,
		state.connection.isWeblnConnected,
	]);
	const { data, mutate } = useSWR([API_NAMES.AUTH_LNURL, hasToken], getSWROptions(API_NAMES.AUTH_LNURL));

	React.useEffect(() => {
		const cleanup = baseSocketClient.listenOnce(WS_CUSTOM_TYPES.LNURL_AUTH_CREDENTIALS, data => {
			dispatch(setDialog(DIALOGS.NONE));
			dispatch(setApiKey(data.accessToken));
			const userData = {
				token: data?.accessToken,
				email: '',
				type: USER_TYPE.PRO,
			};

			displayToast(<p>Login Success</p>, {
				type: 'success',
				level: TOAST_LEVEL.CRITICAL,
			});
			dispatch(setUserData(userData));
			defaultLocalStore.cookieSet(CONTEXTS.LOCAL_STORAGE.FULL_USER, { ...userData });
			if (data?.refreshToken) defaultLocalStore.cookieSet(CONTEXTS.LOCAL_STORAGE.FULL_USER_REFRESH, data.refreshToken);
		});
		return () => {
			mutate();
			cleanup();
		};
	}, [dispatch, mutate]);

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
					<div className="my-1.5 w-full">
						<p className="text-center">
							Expires in: <span className="font-mono text-red-600">{time / 1000}</span>s
						</p>
					</div>
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
