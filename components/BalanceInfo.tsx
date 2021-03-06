import React from 'react';

import cn from 'clsx';

import { baseSocketClient } from 'classes/SocketClient';
import { baseUmbrelSocketClient } from 'classes/UmbrelSocketClient';
import { WithdrawLimitLine } from 'components/WithdrawLimit';
import { DIALOGS, MESSAGE_TYPES, UMBREL_MESSAGE_TYPES } from 'consts';
import { setDialog } from 'contexts/modules/layout';
import { useAppDispatch, useAppSelector } from 'hooks';
import { fixed } from 'utils/Big';
import { formatNumber } from 'utils/format';
import { umbrelWithdraw } from 'utils/umbrel';

export const BalanceInfo = () => {
	const dispatch = useAppDispatch();
	const balances = useAppSelector(state => state.trading.balances);
	const cash = fixed(balances.cash.SAT, 0);
	const isUmbrel = process.env.NEXT_PUBLIC_UMBREL === '1';
	return (
		<div className="mt-3 gap-x-5 flex flex-wrap xs:flex-nowrap items-center justify-between">
			<div className="flex items-center justify-start gap-4">
				<div className="flex flex-col gap-2">
					<div>
						<p className="text-xs tracking-tightest leading-none text-gray-400 whitespace-nowrap">
							{isUmbrel ? 'Kollider Balance' : 'Available'}
						</p>
						<p className="text-sm tracking-tighter leading-none pt-0.5">
							{formatNumber(cash)}
							<span className="pl-1 text-xs">SATS</span>
						</p>
					</div>
					{isUmbrel && <UmbrelBalance />}
				</div>

				<button
					onClick={() => {
						if (Number(cash) < 1) return;
						if (process.env.NEXT_PUBLIC_UMBREL === '1') {
							umbrelWithdraw(Number(cash), res => {
								console.log('created withdraw request');
								try {
									const body = { amount: Number(cash), invoice: res.data?.paymentRequest };
									baseSocketClient.socketSend(MESSAGE_TYPES.WITHDRAWAL_REQUEST, body);
								} catch (ex) {
									console.error(ex);
									console.log('An error occurred while trying to withraw funds');
								}
							});
						} else {
							dispatch(setDialog(DIALOGS.SETTLE_INVOICE));
						}
					}}
					className={cn(
						Number(cash) > 0 ? 'hover:opacity-80 cursor-pointer' : 'opacity-50 cursor-not-allowed',
						isUmbrel ? 'py-6' : 'py-2',
						'px-4 border border-theme-main rounded-lg'
					)}>
					<p className="text-xs">Withdraw</p>
				</button>
			</div>
			<WithdrawLimitLine />
		</div>
	);
};

interface GetWalletBalanceResponse {
	type: string;
	data: {
		confirmed_balance: string;
		total_balance: string;
	};
}

interface GetChannelBalanceResponse {
	type: string;
	data: {
		local: string;
		remote: string;
	};
}

const UmbrelBalance = () => {
	const [isUmbrelUsable, localBalance] = useAppSelector(state => [
		state.connection.isUmbrelAuthenticated && state.connection.isUmbrelConnected,
		state.umbrel.localBalance,
	]);
	const [cash, setCash] = React.useState<string>();

	React.useEffect(() => {
		if (!isUmbrelUsable) return;
		baseUmbrelSocketClient.socketSend('GET_CHANNEL_BALANCE', data => {
			setCash(formatNumber(data.data.local))
		})
	}, [isUmbrelUsable]);

	React.useEffect(() => {
		if (!isUmbrelUsable) return;
		setCash(formatNumber(localBalance));
	}, [localBalance]);

	return (
		<div>
			<p className="text-xs tracking-tightest leading-none text-gray-400 whitespace-nowrap">Node Balance</p>
			<p className="text-sm tracking-tighter leading-none pt-0.5">
				{cash ? formatNumber(localBalance) : '-'}
				<span className="pl-1 text-xs">SATS</span>
			</p>
		</div>
	);
};
