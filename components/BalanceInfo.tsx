import { DIALOGS } from 'consts';
import { setDialog } from 'contexts/modules/layout';
import { useAppDispatch, useAppSelector } from 'hooks';
import { fixed } from 'utils/Big';
import { formatNumber } from 'utils/format';

export const BalanceInfo = () => {
	const dispatch = useAppDispatch();
	const balances = useAppSelector(state => state.trading.balances);
	const cash = fixed(balances.cash, 0);
	return (
		<div className="mt-4">
			<div className="flex items-center justify-start gap-6">
				<div>
					<p className="text-xs tracking-tightest leading-none text-gray-400">Available</p>
					<p className="text-sm tracking-tighter leading-none pt-0.5">
						{formatNumber(cash)}
						<span className="pl-1 text-xs">SATS</span>
					</p>
				</div>
				<button
					onClick={() => {
						if (Number(cash) > 0) dispatch(setDialog(DIALOGS.SETTLE_INVOICE));
					}}
					className="py-2 px-4 border border-theme-main rounded-lg hover:opacity-80">
					<p className="text-xs">Withdraw</p>
				</button>
			</div>
		</div>
	);
};
