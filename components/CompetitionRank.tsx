import React from 'react';

import cn from 'clsx';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import lowerCase from 'lodash/lowerCase';
import map from 'lodash/map';
import upperFirst from 'lodash/upperFirst';
import useSWR from 'swr';

import Loader from 'components/Loader';
import { API_NAMES, GENERAL, SETTINGS, TIME, USER_TYPE } from 'consts';
import { useAppSelector } from 'hooks';
import { divide } from 'utils/Big';
import { getSWROptions } from 'utils/fetchers';
import { timestampByInterval } from 'utils/scripts';

dayjs.extend(utc);

const SORT_CRITERIA = ['totalVolume', 'totalRpnl'];
const DISPLAY_CRITERIA = map(SORT_CRITERIA, v => upperFirst(lowerCase(v)));
const SYMBOL_LIST = ['BTCUSD.PERP', 'BCHUSD.PERP', 'DOGUSD.PERP', 'ETHUSD.PERP', 'LTCUSD.PERP'];
// only load if logged in
export const CompetitionRank = () => {
	const COMPETITION_SYMBOL = SYMBOL_LIST[Math.ceil(Number(divide(Date.now(), TIME.HOUR * 24)) + 2) % 5];
	const symbol = COMPETITION_SYMBOL;

	// const { symbol } = useSymbols();
	const sort = DISPLAY_CRITERIA[0];

	const weekDay = dayjs().utc().day();
	const start =
		timestampByInterval(dayjs().utc().valueOf(), TIME.HOUR * 24) - (weekDay === 0 ? 7 : weekDay) * TIME.HOUR * 24;
	const end = start + TIME.HOUR * 24 * 7;
	const { data } = useSWR(
		symbol ? [API_NAMES.TRADE_LEADERBOARD, null, start, end] : undefined,
		getSWROptions(API_NAMES.TRADE_LEADERBOARD)
	);

	const [requestBody, setRequestBody] = React.useState({ uids: null });

	React.useEffect(() => {
		if (!data) return;
		setRequestBody(prevState => {
			prevState.uids = map(data, v => Number(v.uid));
			return { ...prevState };
		});
	}, [data]);

	const { data: userData } = useSWR(
		requestBody.uids ? [API_NAMES.MULTI_USER_DATA, GENERAL.DEFAULT.ARR, requestBody] : undefined,
		getSWROptions(API_NAMES.MULTI_USER_DATA)
	);

	const hasCompetition = COMPETITION_SYMBOL === symbol;

	const [userType, hasToken] = useAppSelector(state => [state.user.data.type, state.connection.apiKey]);
	//	get username
	const { data: myUserData } = useSWR(
		userType !== USER_TYPE.LIGHT ? [API_NAMES.USER_ACCOUNT, hasToken] : undefined,
		getSWROptions(API_NAMES.USER_ACCOUNT)
	);
	const myUsername = myUserData?.username;
	return data ? <Content /> : <Loader />;
};

const Content = () => {
	return (
		<div>
			<p>Content</p>
		</div>
	);
};
