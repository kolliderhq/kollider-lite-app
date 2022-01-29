import React from 'react';

import { useAppSelector } from 'hooks';

import { useGetMyUserData } from './Leaderboard';

export const UserInfo = () => {
	const userData = useGetMyUserData();
	return (
		<div className="pt-1">
			<div className="w-full flex items-center justify-between xxs:justify-end gap-6">
				<p className="text-xs text-gray-400 leading-none">Username</p>
				<p className="text-[10px] leading-none">{userData?.username}</p>
			</div>
		</div>
	);
};
