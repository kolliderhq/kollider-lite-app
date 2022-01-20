import React, { ReactNode } from 'react';

import cn from 'clsx';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { sort as fastSort } from 'fast-sort';
import empty from 'is-empty';
import find from 'lodash/find';
import map from 'lodash/map';
import toNumber from 'lodash/toNumber';
import Img from 'next/image';
import useSWR from 'swr';

import Loader, { DefaultLoader } from 'components/Loader';
import { API_NAMES, GENERAL, SETTINGS, TIME, USER_TYPE } from 'consts';
import { useAppSelector } from 'hooks';
import useCountdown from 'hooks/useCountdown';
import { divide, fixed, minus } from 'utils/Big';
import { getSWROptions } from 'utils/fetchers';
import { formatNumber, getSatsToDollar } from 'utils/format';
import { timestampByInterval } from 'utils/scripts';
import { FixedLengthArray } from 'utils/types/utils';

dayjs.extend(utc);

export const Leaderboard = () => {
	const [leaderboardData, end] = useGetLeaderboardData();

	const [requestBody, setRequestBody] = React.useState({ uids: null });

	React.useEffect(() => {
		if (!leaderboardData) return;
		setRequestBody(prevState => {
			prevState.uids = map(leaderboardData, v => Number(v.uid));
			return { ...prevState };
		});
	}, [leaderboardData]);

	const { data: userData } = useSWR(
		requestBody.uids ? [API_NAMES.MULTI_USER_DATA, GENERAL.DEFAULT.ARR, requestBody] : undefined,
		getSWROptions(API_NAMES.MULTI_USER_DATA)
	);

	const mergedData = React.useMemo(() => {
		if (empty(userData) || empty(leaderboardData)) return GENERAL.DEFAULT.ARR;
		const merged = map(leaderboardData, v => {
			const ret = { ...v };
			const found = find(userData, user => toNumber(user.uid) === toNumber(ret.uid));
			if (found) {
				ret.username = found.username;
			}
			return ret;
		});
		return fastSort(merged).desc(user => user?.totalVolume);
	}, [userData, leaderboardData]);

	const [myData, setMyData] = React.useState({ rank: -1, volume: '0' });

	const myUserData = getMyUserData();
	const myUsername = myUserData?.username;
	React.useEffect(() => {
		if (!myUserData || empty(mergedData)) return;
		const rank = mergedData.findIndex(v => v.username === myUsername);
		const volume = fixed(mergedData[rank]?.totalVolume, 0);
		setMyData({ rank, volume });
	}, [myUsername, mergedData]);

	return (
		<div className="w-full">
			<div className="flex flex-col justify-center items-center mt-2">
				<p className="text-sm text-gray-200 text-center sm:float-right leading-loose">Competition end time</p>
				<div className="flex items-center">
					<LeaderboardCountdown countdownEnd={end} />
				</div>
			</div>
			<LeaderboardInfo />
			<div className="grid grid-rows-auto xs:grid-rows-1 grid-cols-1 xs:grid-cols-2 gap-2 w-full h-full">
				<RankArea rank={myData.rank + 1} volume={myData.volume} data={mergedData} />
				<section className="py-2">
					<h5 className="text-center mb-2">Ranking by Volume</h5>
					<LeaderboardTable data={mergedData} />
				</section>
			</div>
		</div>
	);
};

const LeaderboardCountdown = ({ countdownEnd }) => {
	const countdown = useCountdown(countdownEnd);
	const time = dayjs.duration(countdown, 'millisecond').format('D-HH-mm-ss');
	const [day, hour, minute, second] = time.split('-');
	return (
		<h4 className="flex items-center font-mono">
			{day}
			<span className="text-sm inline-block py-1 px-2 h-full rounded-lg bg-gray-700 mx-1.5">D</span>
			{hour}
			<span className="text-sm inline-block py-1 px-2 h-full rounded-lg bg-gray-700 mx-1.5">H</span>
			{minute}
			<span className="text-sm inline-block py-1 px-2 h-full rounded-lg bg-gray-700 mx-1.5">M</span>
			{second}
			<span className="text-sm inline-block py-1 px-2 h-full rounded-lg bg-gray-700 ml-1.5">s</span>
		</h4>
	);
};

const LeaderboardInfo = () => {
	return (
		<div className="w-full flex items-center justify-center py-4">
			<div className="p-3 border border-gray-200 rounded-xl">
				<p className="text-xs text-gray-400 leading-tighter">
					Rewards for the <span className="text-theme-main">top 3</span> traders with the Highest Volume.
					<br />
					🥇 - <span className="text-gray-200">100,000 SATS</span>
					<br />
					🥈 - <span className="text-gray-300">50,000 SATS</span>
					<br />
					🥉 - <span className="text-gray-400">25,000 SATS</span>
					<br />
					Rewards are paid out every week at <span className="text-gray-200 whitespace-nowrap">Monday 00:00 UTC</span>.
				</p>
			</div>
		</div>
	);
};

interface LeaderboardValue {
	meanLeverage: number;
	numberofTrades: number;
	totalRpnl: number;
	totalVolume: number;
	uid: string;
	username: string;
}

const LeaderboardTable = ({ data }: { data: LeaderboardValue[] }) => {
	return (
		<div className="h-[125px] overflow-y-auto w-full grid grid-rows-auto grid-cols-1 p-2 border rounded-lg border-theme-main s-shadow-theme border-opacity-75">
			<ul className="w-full">
				{empty(data) ? <Loader /> : map(data, (v, i) => <LeaderboardRow key={i} data={v} rank={i} />)}
			</ul>
		</div>
	);
};

const LeaderboardRow = ({ data, rank }: { data: LeaderboardValue; rank: number }) => {
	return (
		<li className="w-full pt-1 pb-1 last:pb-0 border-b border-gray-600 last:border-b-0">
			<ul className="grid gap-2 grid-cols-[15%,85%] mx-2">
				<li>
					<p className="text-center">{getRankMedal(`${rank + 1}`)}</p>
				</li>
				<li className="my-auto overflow-x-auto">
					<p className="text-xs text-center">
						{formatNumber(fixed(data?.totalVolume, 0))}
						<span className="pl-1 text-[10px]">SATS</span>
					</p>
				</li>
			</ul>
		</li>
	);
};

const RankArea = ({ rank, volume, data }: { rank: number; volume: string; data: LeaderboardValue[] }) => {
	const rankDisplay = rank <= 0 ? '-' : `${rank}`;
	return (
		<div className="h-full flex flex-col items-center justify-center">
			<div className="px-8 xs:px-3 py-3 border rounded-lg border-theme-main s-shadow-theme border-opacity-75 flex flex-col items-center gap-2">
				<RankDiff rank={rank} volume={volume} data={data}>
					<div>
						<p className="text-xl text-center mb-1">
							Rank
							<span className="pl-1.5">
								{getRankMedal(rankDisplay)}
								{Number(rankDisplay) > 3 && <span className="text-[10px] align-top inline leading-[1.5]">th</span>}
							</span>
						</p>
						<p className="text-sm text-center leading-tight text-gray-400">
							{formatNumber(volume)}
							<span className="text-xs pl-1">SATS</span>
							<br />
							≈${Number(volume) >= 1 ? getSatsToDollar(Number(volume)) : '-'}
						</p>
					</div>
				</RankDiff>
			</div>
		</div>
	);
};

interface RankUser {
	rank: number;
	diff: string;
}
const abs = (value: string) => fixed(Math.abs(Number(value)), 0);
const RankDiff = ({
	rank,
	volume,
	data,
	children,
}: {
	rank: number;
	volume: string;
	data: LeaderboardValue[];
	children: ReactNode;
}) => {
	const [above, below] = React.useMemo(() => {
		if (rank === 0) return [null, null];
		let above, below;
		if (rank === 1) {
			above = { rank: 0, diff: '0' };
			below = { rank: 2, diff: abs(minus(data[1]?.totalVolume, volume)) };
		} else if (rank === data.length) {
			above = { rank: data.length - 1, diff: abs(minus(data[data.length - 2]?.totalVolume, volume)) };
			below = { rank: 0, diff: volume };
		} else {
			above = { rank: rank - 1, diff: abs(minus(data[rank - 2]?.totalVolume, volume)) };
			below = { rank: rank + 1, diff: abs(minus(data[rank]?.totalVolume, volume)) };
		}
		return [above, below];
	}, [rank, data, volume]) as FixedLengthArray<[RankUser, RankUser]>;

	if (!below) return <>{children}</>;
	return (
		<>
			{above?.rank ? (
				<div className="flex items-center gap-3 justify-between">
					<div className="flex items-center">
						<Img className="s-filter-green-400" width={16} height={16} src="/assets/common/rank-arrow.svg" />
						<p className="text-base leading-none w-2 text-center">{above?.rank} </p>
					</div>
					<p className="text-xs leading-none">
						{formatNumber(above.diff)}
						<span className="text-[10px] p-1">SATS</span>
					</p>
				</div>
			) : (
				''
			)}
			{children}
			{below?.rank ? (
				<div className="flex items-center gap-3 justify-between">
					<div className="flex items-center">
						<Img className="s-filter-red-400 s-flip" width={16} height={16} src="/assets/common/rank-arrow.svg" />
						<p className="text-base leading-none w-2 text-center">{below?.rank}</p>
					</div>
					<p className="text-xs leading-none">
						{formatNumber(below.diff)}
						<span className="text-[10px] p-1">SATS</span>
					</p>
				</div>
			) : (
				''
			)}
		</>
	);
};

const getRankMedal = (rank: string) => {
	if (rank === '1') return '🥇';
	if (rank === '2') return '🥈';
	if (rank === '3') return '🥉';
	return `${rank}`;
};

const getMyUserData = () => {
	const [userType, apiKey] = useAppSelector(state => [state.user.data.type, state.connection.apiKey]);
	//	get username
	const { data: myUserData } = useSWR(
		userType !== USER_TYPE.LIGHT ? [API_NAMES.USER_ACCOUNT, apiKey] : undefined,
		getSWROptions(API_NAMES.USER_ACCOUNT)
	);
	return myUserData;
};

const useGetLeaderboardData = () => {
	const weekDay = dayjs().utc().day();
	const start =
		timestampByInterval(dayjs().utc().valueOf(), TIME.HOUR * 24) - (weekDay === 0 ? 7 : weekDay) * TIME.HOUR * 24;
	const end = start + TIME.HOUR * 24 * 7;
	const { data } = useSWR([API_NAMES.TRADE_LEADERBOARD, null, start, end], getSWROptions(API_NAMES.TRADE_LEADERBOARD));
	return [data, end];
};
