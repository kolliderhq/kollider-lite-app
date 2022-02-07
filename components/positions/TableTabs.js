import { TABLE_TABS } from 'consts';
import { setTableTab } from 'contexts/modules/layout';
import { useAppDispatch, useAppSelector } from 'hooks';
import cn from 'clsx';

export const TableTabs = () => {
	const [selectedTableTab] = useAppSelector(state => [state.layout.selectedTableTab]);
	const dispatch = useAppDispatch();
	return (
		<div className="flex grid grid-cols-3 bg-gray-900 mb-2 p-2">
			<div className={cn(selectedTableTab === TABLE_TABS.POSITIONS && 'border-b border-white') + ' cursor-pointer'} onClick={() => dispatch(setTableTab(TABLE_TABS.POSITIONS))}>
				Positions
			</div>
			<div className={cn(selectedTableTab === TABLE_TABS.TRADES && 'border-b border-white') + ' cursor-pointer'} onClick={() => dispatch(setTableTab(TABLE_TABS.TRADES))}>
				Trades
			</div>
		</div>
	);
};
