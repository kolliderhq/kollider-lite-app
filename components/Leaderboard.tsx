import React, { ReactNode } from 'react';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { sort as fastSort } from 'fast-sort';
import empty from 'is-empty';
import find from 'lodash/find';
import map from 'lodash/map';
import toNumber from 'lodash/toNumber';
import Img from 'next/image';
import useSWR from 'swr';

import Loader from 'components/Loader';
import { API_NAMES, GENERAL, TIME, USER_TYPE } from 'consts';
import { useAppSelector } from 'hooks';
import useCountdown from 'hooks/useCountdown';
import { fixed, minus } from 'utils/Big';
import { getSWROptions } from 'utils/fetchers';
import { formatNumber, getSatsToDollar } from 'utils/format';
import { timestampByInterval } from 'utils/scripts';
import { FixedLengthArray } from 'utils/types/utils';

import { IUserAccount } from '../utils/refiners/api';

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
		return fastSort(merged).desc(user => user?.score);
	}, [userData, leaderboardData]);

	const [myData, setMyData] = React.useState({ rank: -1, volume: '0' });

	const myUserData = useGetMyUserData();
	const myUsername = myUserData?.username;
	React.useEffect(() => {
		if (!myUserData || empty(mergedData)) return;
		const rank = mergedData.findIndex(v => v.username === myUsername);
		const volume = fixed(mergedData[rank]?.score, 0);
		setMyData({ rank, volume });
	}, [myUsername, mergedData]);

	return (
		<div className="w-full">
			<div className="flex flex-col justify-center items-center">
				<p className="text-sm text-gray-200 text-center sm:float-right leading-loose">Competition end time</p>
				<div className="flex items-center">
					<LeaderboardCountdown countdownEnd={end} />
				</div>
			</div>
			<LeaderboardInfo />
			<div className="flex flex-col w-full h-full">
				<RankArea rank={myData.rank + 1} volume={myData.volume} data={mergedData} />
				<div className="mt-4">
					<h5 className="text-center mb-2">Ranking by Score</h5>
					<LeaderboardTable data={mergedData} />
				</div>
			</div>
		</div>
	);
};
const floorModPad = (value, mod, pad) => {
	return String(Math.floor(value) % mod).padStart(pad, '0');
};

const LeaderboardCountdown = ({ countdownEnd }) => {
	const countdown = useCountdown(countdownEnd);
	const duration = dayjs.duration(countdown, 'millisecond');
	const day = floorModPad(duration.asDays(), 3650, 0);
	const hour = floorModPad(duration.asHours(), 24, 2);
	const minute = floorModPad(duration.asMinutes(), 60, 2);
	const second = floorModPad(duration.asSeconds(), 60, 2);
	// const [day, hour, minute, second] = time.split('-');
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
				<p className="col-span-2 text-gray-500 text-sm w-fit px-4 py-3 rounded-l mb-2 mx-auto">
					<div className="flex flex-col">
						<div className="text-2xl text-white m-auto">Karma Competition ⚡</div>
						<div className="mt-2">
							<div className="mt-2">
								The goal of this competition is to accumulate{' '}
								<span className="text-white font-bold">as much Karma as possible</span>. Karma is awarded through either{' '}
								<span className="text-white font-bold">winning challenges or through trading fees</span>. We pay 1 basis
								point reward on trading fees paid. You'll earn 0.0001 Karma for every Sat spent on fees.
							</div>
						</div>
					</div>
					<div className="flex flex-col w-full mt-2">
						<div className="mx-auto">
							<div className="">
								<span aria-label="emoji" role="img" className="mr-3">
									🥇
								</span>
								<span className="text-md">3,000,000 SATS</span>
							</div>
						</div>
						<div className="grid grid-cols-2 mx-auto gap-8 mt-4 border-b pb-4">
							<div>
								<span aria-label="emoji" role="img" className="mr-3">
									🥈
								</span>
								<span className="text-md">1,000,000 SATS</span>
							</div>
							<div>
								<span aria-label="emoji" role="img" className="mr-3">
									🥉
								</span>
								<span className="text-md">500,000 SATS</span>
							</div>
						</div>
						<div className="grid grid-cols-2 mx-auto gap-4 mt-4">
							<div>
								<span className="mr-3 font-bold text-gray-300">4th</span>
								<span className="text-md">100,000 SATS</span>
							</div>

							<div>
								<span className="mr-3 font-bold text-gray-300">5th</span>
								<span className="text-md">95,000 SATS</span>
							</div>
						</div>
					</div>
				</p>
			</div>
		</div>
	);
};

interface LeaderboardValue {
	meanLeverage: number;
	numberofTrades: number;
	totalRpnl: number;
	score: number;
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
					<p className="text-xs text-center">{formatNumber(fixed(data?.score, 0))}</p>
				</li>
			</ul>
		</li>
	);
};

const RankArea = ({ rank, volume, data }: { rank: number; volume: string; data: LeaderboardValue[] }) => {
	const rankDisplay = rank <= 0 ? '-' : `${rank}`;
	return (
		<div className="h-full flex flex-col items-center justify-center">
			<div className="px-5 py-3 border rounded-lg border-theme-main s-shadow-theme border-opacity-75 flex flex-col items-center gap-2">
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
			below = { rank: 2, diff: abs(minus(data[1]?.score, volume)) };
		} else if (rank === data.length) {
			above = { rank: data.length - 1, diff: abs(minus(data[data.length - 2]?.score, volume)) };
			below = { rank: 0, diff: volume };
		} else {
			above = { rank: rank - 1, diff: abs(minus(data[rank - 2]?.score, volume)) };
			below = { rank: rank + 1, diff: abs(minus(data[rank]?.score, volume)) };
		}
		return [above, below];
	}, [rank, data, volume]) as FixedLengthArray<[RankUser, RankUser]>;

	if (!below) return <>{children}</>;
	return (
		<>
			{above?.rank ? (
				<div className="flex items-center justify-between gap-3">
					<div className="flex items-center">
						<Img className="s-filter-green-400" width={16} height={16} src="/assets/common/rank-arrow.svg" />
						<p className="text-base leading-none text-center">{above?.rank} </p>
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
				<div className="flex items-center justify-between gap-3">
					<div className="flex items-center">
						<Img className="s-filter-red-400 s-flip" width={16} height={16} src="/assets/common/rank-arrow.svg" />
						<p className="text-base leading-none text-center">{below?.rank}</p>
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

export const useGetMyUserData = () => {
	const [userType, apiKey] = useAppSelector(state => [state.user.data.type, state.connection.apiKey]);
	//	get username
	const { data } = useSWR(
		userType === USER_TYPE.PRO ? [API_NAMES.USER_ACCOUNT, apiKey] : undefined,
		getSWROptions(API_NAMES.USER_ACCOUNT)
	);
	return data as IUserAccount;
};

const useGetLeaderboardData = () => {
	const weekDay = dayjs().utc().day();
	const start = dayjs().utc().startOf('month').valueOf();
	const end = dayjs().utc().endOf('month').valueOf();
	const { data } = useSWR([API_NAMES.TRADE_LEADERBOARD, null, start, end], getSWROptions(API_NAMES.TRADE_LEADERBOARD));
	return [data, end];
};
