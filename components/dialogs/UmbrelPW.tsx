import React, { FormEvent } from 'react';

import { baseUmbrelSocketClient } from 'classes/UmbrelSocketClient';
import { setIsUmbrelAuthenticated } from 'contexts';
import { setPopup, setPopupClose } from 'contexts/modules/layout';
import { useAppDispatch } from 'hooks';
import { TOAST_LEVEL, displayToast } from 'utils/toast';

export const UmbrelPWPopup = () => {
	const dispatch = useAppDispatch();
	const socketState = React.useRef({ fetching: false });
	const [pw, setPw] = React.useState('');

	const onConfirm = React.useCallback(() => {
		if (socketState.current.fetching === true) return;
		socketState.current.fetching = true;
		baseUmbrelSocketClient.socketSend('AUTHENTICATION', { password: pw }, data => {
			socketState.current.fetching = false;
			if (data?.data?.status === 'success') {
				displayToast('Umbrel Auth Successful', {
					type: 'success',
					level: TOAST_LEVEL.INFO,
				});
				dispatch(setIsUmbrelAuthenticated(true));
				dispatch(setPopupClose());
			} else {
				// data.data.msg === 'Wrong password' or something like that probably changed by the time you read this
				displayToast('Wrong Password - try again', {
					type: 'error',
					level: TOAST_LEVEL.VERBOSE,
				});
			}
		});
	}, [pw]);

	const onEnter = React.useCallback(
		e => {
			if (e.key === 'Enter') onConfirm();
		},
		[onConfirm]
	);

	return (
		<div className="w-full h-full my-auto">
			<div className="flex flex-col items-center">
				<div className="mx-auto max-w-xxxs w-full px-4 mt-4 border border-gray-600 rounded-lg bg-gray-900 py-4">
					<p className="text-lg text-center py-5">Umbrel Auth</p>
					<div className="h-10 bg-gray-700 border-transparent border-2 rounded-md w-full relative">
						<input
							onKeyDown={onEnter}
							value={pw}
							onInput={(e: FormEvent<HTMLInputElement>) => {
								setPw((e.target as HTMLInputElement).value);
							}}
							placeholder="password"
							type="password"
							className="input-default bg-gray-700 inline-block w-full rounded-md border border-transparent focus:border-gray-300 hover:border-gray-300 "
						/>
					</div>
					<div className="w-full flex items-center justify-center mt-3">
						<button
							onClick={onConfirm}
							className="border-theme-main hover:opacity-80 cursor-pointer border rounded-lg px-5 py-2">
							<p>Confirm</p>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};
