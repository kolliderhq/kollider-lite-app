import { TIME } from 'constants/time';

import moment from 'dayjs';
import timezone from 'dayjs/plugin/timezone';

import { divide } from 'utils/Big';

moment.extend(timezone);

export const formatSeconds = secs => {
	const pad = n => (n < 10 ? '0' + n : n);

	const h = Math.floor(secs / 3600);
	const m = Math.floor(secs / 60) - h * 60;
	const s = Math.floor(secs - h * 3600 - m * 60);

	return pad(h) + ':' + pad(m) + ':' + pad(s);
};

export const getCurrentTime = () => moment().valueOf();

export const getMsFromNow = unix => moment().diff(unix);

export const getMsBetween = (from, to) => Math.abs(moment(from).diff(to));

export const formatDate = unix => moment(unix).format('YYYY/MM/DD');

export const formatExactDate = unix => moment(unix).format('YYYY/MM/DD HH:mm:ss');

export const formatHour = unix => {
	if (Date.now() - unix < TIME.HOUR * 24) return moment(unix).format('HH:mm');
	else return moment(unix).format('MM/DD HH:mm');
};

export const formatDayHour = unix => {
	return moment(unix).format('MM/DD HH:mm');
};

export const formatDay = unix => moment(unix).format('MM/DD');

const BASE_NANO = Math.pow(10, 18);
const NANO_DIFF = Math.pow(10, 6);
export const parseTime = unix => {
	if (Number(unix) > BASE_NANO) {
		return Number(divide(unix, NANO_DIFF, 0));
	}
	return Number(unix);
};

export const getTimezone = () => moment.tz.guess();
