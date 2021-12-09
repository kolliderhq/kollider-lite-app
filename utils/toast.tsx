import { toast } from 'react-toastify';

import cn from 'clsx';
import isNil from 'lodash-es/isNil';
import isString from 'lodash-es/isString';

const icons = {
	info: '/assets/toasts/info.svg',
	dark: '/assets/toasts/info.svg',
	error: '/assets/toasts/error.svg',
	success: '/assets/toasts/success.svg',
	warn: '/assets/toasts/warn.svg',
};
