import { useSwipeable } from 'react-swipeable';

import { setIncreaseOrderQuantity } from 'contexts';
import { useAppDispatch } from 'hooks';

export const QuantityTouchInput = ({ base }: { base: number }) => {
	const dispatch = useAppDispatch();
	const incHandlers = useSwipeable({
		onTap: () => {
			dispatch(setIncreaseOrderQuantity(base));
		},
	});
	const decHandlers = useSwipeable({
		onTap: () => {
			dispatch(setIncreaseOrderQuantity(-base));
		},
	});
	return (
		<div className="flex items-center justify-center">
			<div className="h-full grid grid-rows-2 gap-4 mx-auto">
				<button
					{...incHandlers}
					className="w-full h-full flex items-center justify-center py-4 px-4 border-theme-main border rounded-lg"
				>
					<p className="text-xs tracking-tightest leading-none">+{base}</p>
				</button>
				<button
					{...decHandlers}
					className="w-full h-full flex items-center justify-center py-4 px-4 border-theme-main border rounded-lg"
				>
					<p className="text-xs tracking-tighter leading-none">-{base}</p>
				</button>
			</div>
		</div>
	);
};
