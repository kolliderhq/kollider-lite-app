import React from 'react';

import cn from 'classnames';

import { useAppSelector } from 'hooks';
import { divide, minus } from 'utils/Big';
import { dispPercentage, formatNumber } from 'utils/format';

export interface LightningLimit {
	limit: number;
	volume: number;
	percent: number;
}

export const useLightningLimit = (): LightningLimit => {
	const withdrawLimitInfo = useAppSelector(state => state.user.withdrawLimits);
	const [lightningLimit, setLightningLimit] = React.useState<LightningLimit>({
		limit: 0,
		volume: 0,
		percent: 0,
	});
	React.useEffect(() => {
		if (!withdrawLimitInfo) return;
		console.log(withdrawLimitInfo);
		if (withdrawLimitInfo.dailyWithdrawalVolumes.lightning < 0) {
			setLightningLimit({
				volume: 0,
				limit: withdrawLimitInfo.dailyWithdrawalLimits.lightning - withdrawLimitInfo.dailyWithdrawalVolumes.lightning,
				percent: 0,
			});
		} else {
			setLightningLimit({
				volume: withdrawLimitInfo.dailyWithdrawalVolumes.lightning,
				limit: withdrawLimitInfo.dailyWithdrawalLimits.lightning,
				percent: Number(
					divide(
						withdrawLimitInfo.dailyWithdrawalVolumes.lightning,
						withdrawLimitInfo.dailyWithdrawalLimits.lightning,
						3
					)
				),
			});
		}
	}, [withdrawLimitInfo]);
	return lightningLimit;
};

export const WithdrawLimitLine = () => {
	const lightningLimit = useLightningLimit();
	return (
		<>
			<div className="w-full my-2">
				<WithdrawLimitDisplay lightningLimit={lightningLimit} />
				<div className="flex items-center justify-between">
					<p className="text-xs text-gray-400">Withdraw Limit</p>
					<p className="text-sm text-right">
						{dispPercentage(1 - lightningLimit.percent, 1)}
						<span className="pl-1 text-xs">left</span>
					</p>
				</div>
				<div
					style={{
						gridTemplateColumns: `${dispPercentage(lightningLimit.percent)} ${dispPercentage(
							1 - lightningLimit.percent
						)}`,
					}}
					className="h-2 w-full rounded-full grid bg-transparent opacity-85 hover:opacity-100"
					role="presentation"
				>
					<div
						className={cn('h-full bg-transparent border-l rounded-l-full border border-theme-main', {
							'rounded-r border-r-full': lightningLimit.percent >= 0.999,
						})}
					/>
					<div
						className={cn('h-full bg-theme-main border-r rounded-r-full border-transparent', {
							'rounded-l border-l-full': lightningLimit.percent <= 0.001,
						})}
					/>
				</div>
			</div>
		</>
	);
};

export const WithdrawLimitDisplay = ({ lightningLimit }: { lightningLimit: LightningLimit }) => {
	return (
		<p className="text-xs xss:text-sm text-right">
			{formatNumber(minus(lightningLimit.limit, lightningLimit.volume, 0))} / {formatNumber(lightningLimit.limit)}
			<span className="pl-1 text-xs">SATS</span>
		</p>
	);
};
