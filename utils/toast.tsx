import React, { ReactNode } from 'react';
import { Theme, ToastOptions as ToastifyOptions, TypeOptions, toast } from 'react-toastify';

import cn from 'clsx';
import isNil from 'lodash-es/isNil';
import isString from 'lodash-es/isString';

import { Nullable } from 'utils/types/utils';

export enum TOAST_LEVEL {
	VERBOSE = 'verbose', //	text input errors
	INFO = 'info', //	info messages
	IMPORTANT = 'important', //	important, position creation order received etc.
	CRITICAL = 'critical', //	network errors, liquidations etc.
	ANNOUNCEMENT = 'announcement', //	Toasts that don't go away or stay for a long time
}

const getAutoClose = (level: TOAST_LEVEL) => {
	switch (level) {
		case TOAST_LEVEL.VERBOSE:
			return 500;
		case TOAST_LEVEL.INFO:
			return 1500;
		case TOAST_LEVEL.IMPORTANT:
			return 2000;
		case TOAST_LEVEL.CRITICAL:
			return 3000;
		case TOAST_LEVEL.ANNOUNCEMENT:
			return 4000;
	}
};
export type ToastOptions = {
	type: TypeOptions | Theme;
	level: TOAST_LEVEL;
	shouldSave?: boolean;
	toastId?: string;
	toastOptions?: Partial<ToastifyOptions>;
};

const defaultOptions = {
	position: 'top-center',
	autoClose: 3000,
	hideProgressBar: true,
	closeOnClick: true,
	pauseOnHover: true,
	draggable: false,
	progress: undefined,
	pauseOnFocusLoss: false,
} as Partial<ToastOptions>;

export const displayToast = (value: ReactNode, options: ToastOptions) => {
	const inputOptions = {
		...defaultOptions,
		autoClose: getAutoClose(options.level),
		...options.toastOptions,
		toastId: options?.toastId,
		// autoClose: false,
	};
	if (inputOptions?.onClick) {
		if (!inputOptions.hideProgressBar) inputOptions.hideProgressBar = false;
	}

	// TODO : Add and push to notifications
	inputOptions.icon = () => <StatusIcon type={options.type} isLink={!!inputOptions.onClick} />;
	return toast[options.type](
		<ToastContent content={value} type={options.type} isLink={!!inputOptions?.onClick} />,
		inputOptions
	);
};

const ToastContent = ({ type, content, isLink }) => {
	return (
		<div className="min-h-4">{isString(content) ? <p className={cn('text-sm break-word')}>{content}</p> : content}</div>
	);
};

const InfoSvg = ({ className }) => {
	return (
		<svg
			className={className}
			stroke="currentColor"
			fill="none"
			strokeWidth="2"
			viewBox="0 0 24 24"
			strokeLinecap="round"
			strokeLinejoin="round"
			xmlns="http://www.w3.org/2000/svg"
		>
			<circle cx="12" cy="12" r="10" />
			<line x1="12" y1="16" x2="12" y2="12" />
			<line x1="12" y1="8" x2="12.01" y2="8" />
		</svg>
	);
};

const WarnSvg = ({ className }) => {
	return (
		<svg
			className={className}
			stroke="currentColor"
			fill="currentColor"
			strokeWidth="0"
			version="1.1"
			viewBox="0 0 16 16"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path d="M8 1.45l6.705 13.363h-13.409l6.705-13.363zM8 0c-0.345 0-0.69 0.233-0.951 0.698l-6.829 13.611c-0.523 0.93-0.078 1.691 0.989 1.691h13.583c1.067 0 1.512-0.761 0.989-1.691h0l-6.829-13.611c-0.262-0.465-0.606-0.698-0.951-0.698v0z" />
			<path d="M9 13c0 0.552-0.448 1-1 1s-1-0.448-1-1c0-0.552 0.448-1 1-1s1 0.448 1 1z" />
			<path d="M8 11c-0.552 0-1-0.448-1-1v-3c0-0.552 0.448-1 1-1s1 0.448 1 1v3c0 0.552-0.448 1-1 1z" />
		</svg>
	);
};

const SuccessSvg = ({ className }) => {
	return (
		<svg
			className={className}
			stroke="currentColor"
			fill="currentColor"
			strokeWidth="0"
			viewBox="0 0 512 512"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path d="M256 8C119.033 8 8 119.033 8 256s111.033 248 248 248 248-111.033 248-248S392.967 8 256 8zm0 48c110.532 0 200 89.451 200 200 0 110.532-89.451 200-200 200-110.532 0-200-89.451-200-200 0-110.532 89.451-200 200-200m140.204 130.267l-22.536-22.718c-4.667-4.705-12.265-4.736-16.97-.068L215.346 303.697l-59.792-60.277c-4.667-4.705-12.265-4.736-16.97-.069l-22.719 22.536c-4.705 4.667-4.736 12.265-.068 16.971l90.781 91.516c4.667 4.705 12.265 4.736 16.97.068l172.589-171.204c4.704-4.668 4.734-12.266.067-16.971z" />
		</svg>
	);
};

const ErrorSvg = ({ className }) => {
	return (
		<svg
			className={className}
			stroke="currentColor"
			fill="currentColor"
			strokeWidth="0"
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path d="M11.953,2C6.465,2,2,6.486,2,12s4.486,10,10,10s10-4.486,10-10S17.493,2,11.953,2z M12,20c-4.411,0-8-3.589-8-8 s3.567-8,7.953-8C16.391,4,20,7.589,20,12S16.411,20,12,20z" />
			<path d="M11 7H13V14H11zM11 15H13V17H11z" />
		</svg>
	);
};

function StatusIcon({ type, isLink }) {
	const className = cn('s-filter-white w-8 h-8', { underline: isLink });
	if (type === 'info' || type === 'dark') return <InfoSvg className={className} />;
	else if (type === 'warning') return <WarnSvg className={className} />;
	else if (type === 'success') return <SuccessSvg className={className} />;
	else return <ErrorSvg className={className} />;
}
