import React, { useState } from 'react';

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

export const LoginDialog = () => {
	return (
		<WrapHasLightClient
			loaderElement={
				<div className="h-[364px]">
					<Loader />
				</div>
			}
		>
			<LoginContents />
		</WrapHasLightClient>
	);
};

export const Terms = ({ setHasAcceptedTOC, setHasAcceptedPP, hasAcceptedTOC, hasAcceptedPP }) => {
	const acceptTerms = event => {
		if (event.target.value === 'acceptTOC') {
			if (hasAcceptedTOC) {
				setHasAcceptedTOC(false);
			} else {
				setHasAcceptedTOC(true);
			}
		}

		if (event.target.value === 'acceptPP') {
			if (hasAcceptedPP) {
				setHasAcceptedPP(false);
			} else {
				setHasAcceptedPP(true);
			}
		}
	};
	return (
		<div className="text-white">
			<div className='w-46'>Please Accept our Privacy Policy and Terms of Service first.</div>
			<div className="flex items-center mb-4 mt-4">
				{/* <input type="checkbox" onClick={() => console.log('click')} /> */}
				<input
					type="checkbox"
					onClick={acceptTerms}
					value="acceptTOC"
					checked={hasAcceptedTOC === true}
					name="toc-radio"
					className="w-4 h-4 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
				/>
				<a
					className="cursor-pointer ml-2 text-sm font-medium hover:border-b"
					onClick={() => window.open('https://cdn.kollider.xyz/tos/kollider_terms_of_service.html')}>
					Terms of Service
				</a>
			</div>
			<div className="flex items-center mb-4">
				<input
					type="checkbox"
					onClick={acceptTerms}
					value="acceptPP"
					checked={hasAcceptedPP === true}
					name="pp-radio"
					className="w-4 h-4 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
				/>
				<a
					className="cursor-pointer ml-2 text-sm font-medium hover:border-b"
					onClick={() => window.open('https://cdn.kollider.xyz/privacy/kollider_privacy_policy.html')}>
					Privacy Policy
				</a>
			</div>
		</div>
	);
};

const LoginContents = () => {
	const dispatch = useAppDispatch();
	const [time] = useTimer(SETTINGS.LIMITS.INVOICE, () => dispatch(setDialog(DIALOGS.NONE)));
	const [hasToken, isWeblnConnected] = useAppSelector(state => [
		state.connection.apiKey,
		state.connection.isWeblnConnected,
	]);
	const [hasAcceptedPP, setHasAcceptedPP] = useState(false);
	const [hasAcceptedTOC, setHasAcceptedTOC] = useState(false);

	const hasAcceptedAll = () => {
		return hasAcceptedPP && hasAcceptedTOC
	}

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
			{
				!hasAcceptedAll() ? (
					<Terms hasAcceptedPP={hasAcceptedPP} hasAcceptedTOC={hasAcceptedTOC} setHasAcceptedPP={setHasAcceptedPP} setHasAcceptedTOC={setHasAcceptedTOC}/>
				) : (
					<div>
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

				)
			}
		</div>
	);
};
