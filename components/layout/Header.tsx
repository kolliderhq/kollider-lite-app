import React from 'react';

import cn from 'clsx';
import { router } from 'next/client';
import Img from 'next/image';
import useSWR from 'swr';

import { auth } from 'classes/Auth';
import { API_NAMES, DIALOGS, GENERAL, USER_TYPE } from 'consts';
import { TABS } from 'consts';
import { setDialog } from 'contexts/modules/layout';
import { setTab } from 'contexts/modules/layout';
import { useAppDispatch, useAppSelector } from 'hooks';
import { weblnConnectAttempt } from 'hooks/init/useWebln';

import { fetcher, getSWROptions } from '../../utils/fetchers';

export const Header = () => {
	const dispatch = useAppDispatch();
	const [requestLogin, setRequestLogin] = React.useState(false);
	const userType = useAppSelector(state => state.user.data.type);

	const { data } = useSWR(
		requestLogin ? [API_NAMES.MIGRATE_ACCOUNT] : undefined,
		getSWROptions(API_NAMES.MIGRATE_ACCOUNT)
	);

	React.useEffect(() => {
		if (!data) return;
		console.log(data);
		// TODO : use the data to send the user to pro with query params
		//	https://pro.kollider.xyz?migrate_account={token}
		if (process.env.NODE_ENV === 'production')
			window.open(`https://${GENERAL.URL_PROD}?migrate_account=${data.token}`, '_self');
		else window.open(`http://pro.staging.kollider.internal?migrate_account=${data.token}`, '_self');
	}, [data]);

	const [currentDialog, loggedIn] = useAppSelector(state => [
		state.layout.dialog,
		state.user.data.token !== '' && state.user.data.type === USER_TYPE.PRO,
	]);

	const onClickLogin = () => {
		dispatch(setDialog(DIALOGS.LOGIN));
	};

	const onClickToPro = React.useCallback(
		e => {
			e.preventDefault();
			if (userType !== USER_TYPE.PRO) {
				window.open(`https://${GENERAL.URL_PROD}`, '_self');
				return;
			}
			setRequestLogin(true);
		},
		[userType]
	);

	return (
		<div className="flex items-center justify-between w-full h-16 pb-4">
			<figure className="w-full flex items-center justify-start relative">
				<p className="text-[10px] xs:text-xs absolute left-[135px] xs:left-[125px] top-[-12px] xs:top-[-8px]">Lite</p>
				<img className="w-30 h-[30px] xs:w-30 xs:h-8" src="/assets/logos/kollider_logo_gradient.png" />
			</figure>
			<div className="col-span-2 w-full flex items-center justify-end gap-3 xxs:gap-4">
				<div className="flex h-full border-r border-gray-600 hidden sm:block">
					<button
						className="m-auto mr-3 transition ease-in-out hover:-translate-y-1 hover:scale-110"
						onClick={() => {
							dispatch(setTab(TABS.ORDER));
						}}>
						Trade
					</button>
				</div>
				<div className="flex h-full border-r border-gray-600 hidden sm:block">
					<button
						className="m-auto mr-3 transition ease-in-out hover:-translate-y-1 hover:scale-110"
						onClick={() => {
							dispatch(setTab(TABS.RANKS));
						}}>
						Competition
					</button>
				</div>
				<div className="flex h-full border-r border-gray-600 hidden sm:block">
					<div className="m-auto mr-3 transition ease-in-out hover:-translate-y-1 hover:scale-110">
						<a
							onClick={onClickToPro}
							className="m-auto mr-3 transition ease-in-out hover:-translate-y-1 hover:scale-110"
							href="https://pro.kollider.xyz">
							{' '}
							Pro
						</a>
					</div>
				</div>
				<WeblnButton />
				{!loggedIn && (
					<button
						onClick={() => dispatch(setDialog(DIALOGS.LOGIN))}
						className="py-1 px-2 border border-gray-100 shadow-elevation-08dp hover:border-theme-main rounded-md group hover:opacity-80">
						<p className="text-xs xxs:text-sm flex flex-col items-center xs:block">
							<img className="xs:inline mr-1" width={16} height={16} src="/assets/common/lightning.svg" />
							Login
						</p>
					</button>
				)}
				<button
					onClick={() => dispatch(setDialog(DIALOGS.SETTINGS))}
					className={cn(
						{ 'rotate-90 s-filter-theme-main': currentDialog === DIALOGS.SETTINGS },
						'min-w-[28px] mr-1 py-2 flex items-center justify-center hover:rotate-90 s-transition-rotate s-filter-theme-main-hover hover:opacity-80'
					)}>
					<Img width={20} height={20} src={'/assets/common/settings.svg'} />
				</button>
			</div>
			{loggedIn && (
				<button
					data-cy="button-logout"
					data-tip
					data-for="logout"
					onClick={() => {
						auth.logoutUser();
					}}
					className="s-filter-theme-main-hover cursor-pointer px-2">
					<img className="h-5 w-5 min-w-[20px]" src={'/assets/common/logout.svg'} alt="logout" />
				</button>
			)}
		</div>
	);
};

const WeblnButton = () => {
	const [isWeblnConnected, isUmbrelConnected] = useAppSelector(state => [
		state.connection.isWeblnConnected,
		state.connection.isUmbrelConnected,
	]);

	return !isWeblnConnected && !isUmbrelConnected ? (
		<button
			onClick={() => weblnConnectAttempt()}
			className="py-1 px-2 border border-gray-100 shadow-elevation-24dp hover:border-theme-main rounded-md group hover:opacity-80">
			<p className="text-xs xxs:text-sm flex flex-col items-center xs:block">
				<img className="xs:inline mr-1" width={16} height={16} src="/assets/common/socket.svg" />
				Webln
			</p>
		</button>
	) : null;
};
