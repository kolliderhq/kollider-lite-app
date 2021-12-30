import React from 'react';

import cn from 'clsx';
import Img from 'next/image';

import { DIALOGS, USER_TYPE } from 'consts';
import { setDialog } from 'contexts/modules/layout';
import { logOutFunc, useAppDispatch, useAppSelector } from 'hooks';

export const Header = () => {
	const dispatch = useAppDispatch();
	const [currentDialog, loggedIn, isWeblnConnected] = useAppSelector(state => [
		state.layout.dialog,
		state.user.data.token !== '' && state.user.data.type === USER_TYPE.PRO,
		state.connection.isWeblnConnected,
	]);
	return (
		<div className="flex items-center justify-between w-full h-16 pb-4 mb-2">
			<figure className="w-full flex items-center justify-start">
				<img className="w-30 h-[30px] xs:w-40 xs:h-10" src="/assets/logos/kollider_logo_white.png" />
			</figure>
			<div className="col-span-2 w-full flex items-center justify-end gap-3 xxs:gap-4">
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
				{!isWeblnConnected && (
					<button className="py-1 px-2 border border-gray-100 shadow-elevation-24dp hover:border-theme-main rounded-md group hover:opacity-80">
						<p className="text-xs xxs:text-sm flex flex-col items-center xs:block">
							<img className="xs:inline mr-1" width={16} height={16} src="/assets/common/socket.svg" />
							Webln
						</p>
					</button>
				)}
				<button
					onClick={() => dispatch(setDialog(DIALOGS.SETTINGS))}
					className={cn('min-w-[28px] pr-2 py-2 flex items-center justify-center group hover:opacity-80')}>
					<Img
						className={cn(
							{ 'rotate-90 s-filter-theme-main': currentDialog },
							'group-hover:rotate-90 s-transition-rotate s-filter-theme-main-hover'
						)}
						width={20}
						height={20}
						src={'/assets/common/settings.svg'}
					/>
				</button>
			</div>
			{loggedIn && (
				<button
					data-cy="button-logout"
					data-tip
					data-for="logout"
					onClick={() => {
						logOutFunc();
						// displayToast(
						// 	<p className="text-sm">Successfully logged out</p>,
						// 	'info',
						// 	{
						// 		autoClose: 1500,
						// 		position: 'top-center',
						// 	},
						// 	null,
						// 	null
						// );
					}}
					className="s-filter-theme-main-hover cursor-pointer px-2">
					<img className="h-5 w-5 min-w-[20px]" src={'/assets/common/logout.svg'} alt="logout" />
				</button>
			)}
		</div>
	);
};
