import React from 'react';

import Img from 'next/image';

import { DIALOGS } from 'consts';
import { setDialog } from 'contexts/modules/layout';
import { useAppDispatch } from 'hooks';

export const Header = () => {
	const dispatch = useAppDispatch();
	return (
		<div className="grid grid-cols-2 w-full h-16 pb-4 mb-2">
			<figure className="w-full flex items-center justify-start">
				<Img width={160} height={40} src={'/assets/logos/kollider_logo_white.png'} />
			</figure>
			<div className="w-full flex items-center justify-end gap-4">
				<button
					onClick={() => dispatch(setDialog(DIALOGS.LOGIN))}
					className="py-1 px-2 border border-gray-100 shadow-elevation-08dp hover:border-theme-main rounded-md group hover:opacity-80">
					<p className="text-sm">
						<img className="inline mr-1" width={16} height={16} src="/assets/common/lightning.svg" />
						Login
					</p>
				</button>
				<button className="py-1 px-2 border border-gray-100 shadow-elevation-24dp hover:border-theme-main rounded-md group hover:opacity-80">
					<p className="text-sm">
						<img className="inline mr-1" width={16} height={16} src="/assets/common/socket.svg" />
						Webln
					</p>
				</button>
				<button className="p-2 flex items-center justify-center group hover:opacity-80">
					<Img
						className="group-hover:rotate-90 s-transition-all"
						width={20}
						height={20}
						src={'/assets/common/settings.svg'}
					/>
				</button>
			</div>
		</div>
	);
};
