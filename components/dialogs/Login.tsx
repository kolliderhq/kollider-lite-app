import React from 'react';

import useSWR from 'swr';

import { auth } from 'classes/Auth';
import { baseSocketClient } from 'classes/SocketClient';
import Loader from 'components/Loader';
import { QrCode } from 'components/QrCode';
import { WrapHasLightClient } from 'components/wrappers/LightClientWrapper';
import { API_NAMES, DIALOGS, SETTINGS, WS_CUSTOM_TYPES } from 'consts';
import { setDialog } from 'contexts/modules/layout';
import { useAppDispatch, useAppSelector } from 'hooks';
import useTimer from 'hooks/useTimer';
import { getSWROptions } from 'utils/fetchers';

export const Login = () => {
	return <LoginDialog />;
};

export const LoginDialog = () => {
	return (
		<WrapHasLightClient
			loaderElement={
				<div className="h-[364px]">
					<Loader />
				</div>
			}>
			<LoginContents />
		</WrapHasLightClient>
	);
};

const LoginContents = () => {
	const dispatch = useAppDispatch();
	const [time] = useTimer(SETTINGS.LIMITS.INVOICE, () => dispatch(setDialog(DIALOGS.NONE)));
	const [hasToken, isWeblnConnected] = useAppSelector(state => [
		state.connection.apiKey,
		state.connection.isWeblnConnected,
	]);
	const { data, isValidating, mutate } = useSWR([API_NAMES.AUTH_LNURL, hasToken], getSWROptions(API_NAMES.AUTH_LNURL));

	React.useEffect(() => {
		const cleanup = baseSocketClient.listenOnce(WS_CUSTOM_TYPES.LNURL_AUTH_CREDENTIALS, data => {
			auth.proUserLogin(data);
		});
		return () => {
			mutate();
			cleanup();
		};
	}, [dispatch, mutate]);

	return (
		<div className="w-full h-full my-auto">
			{!data?.lnurlAuth || isValidating ? (
				<div className="h-[467px] min-w-xxxs">
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
