import { LabelledValue } from 'components/Positions';
import { useAppSelector, useSymbolData, useSymbols } from 'hooks';

export const AccountInfo = () => {
	const { symbol } = useSymbols();
	const positions = useAppSelector(state => state.trading.positions);
	const position = positions[symbol];
	const hasPosition = position && position.quantity !== '0';
	return (
		<div className="grid grid-cols-3 gap-2 w-full h-[100px]">
			<section className="col-span-1 flex items-center justify-center h-full w-full">
				<LabelledValue label={'PNL'} value={hasPosition ? position.upnl : '-'} />
			</section>
			<section className="col-span-2 flex items-center justify-center h-full w-full">
				<div>Graph / Stats</div>
			</section>
		</div>
	);
};
