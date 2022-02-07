import { TABLE_TABS } from 'consts';
import { setTableTab } from 'contexts/modules/layout';
import { useAppDispatch, useAppSelector } from 'hooks';
import cn from 'clsx';

export const TableTabs = () => {
	const [selectedTableTab] = useAppSelector(state => [state.layout.selectedTableTab]);
	const dispatch = useAppDispatch();
	return (
		<div className="flex grid grid-cols-3 bg-gray-900 mb-2 py-2">
			<div className={cn(selectedTableTab === TABLE_TABS.POSITIONS && 'border-b border-theme-main') + ' cursor-pointer pb-2'} onClick={() => dispatch(setTableTab(TABLE_TABS.POSITIONS))}>
				Positions
			</div>
			<div className={cn(selectedTableTab === TABLE_TABS.TRADES && 'border-b border-theme-main') + ' cursor-pointer pb-2'} onClick={() => dispatch(setTableTab(TABLE_TABS.TRADES))}>
				Trades
			</div>
		</div>
	);
};
