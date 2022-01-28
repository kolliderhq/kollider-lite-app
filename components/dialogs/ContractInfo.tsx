import React, { ReactNode } from 'react';

import cn from 'clsx';

import { useSymbolData } from 'hooks';

export const ContractInfoDialog = () => {
	const { symbol, contractSize, isInversePriced, tickSize, maintenanceMargin, maxLeverage } = useSymbolData();

	return (
		<div className="w-full h-full mt-5">
			<h2 className="text-center text-xl xs:text-2xl">Contract Info</h2>
			<section className="container-spacious container-children-bottom-border mt-5 flex flex-col items-center">
				<LabelledValue label="Symbol">
					<p className="text-sm">{symbol}</p>
				</LabelledValue>
				<LabelledValue label="Contract Type">
					<p className={cn('text-sm')}>{isInversePriced ? 'Perpetual' : 'Quanto'}</p>
				</LabelledValue>
				<LabelledValue label="Contract Size">
					<p className="text-sm">
						{contractSize} {isInversePriced ? 'USD : Contract' : 'SATS : USD'}
					</p>
				</LabelledValue>
				<LabelledValue label={'Tick Size'}>
					<p className="text-sm">{tickSize}</p>
				</LabelledValue>
				<LabelledValue label={'Max Leverage'}>
					<p className="text-sm">{maxLeverage}x</p>
				</LabelledValue>
				<LabelledValue label={'Maintenance Margin'}>
					<p className="text-sm">{maintenanceMargin}%</p>
				</LabelledValue>
			</section>
		</div>
	);
};

const LabelledValue = ({ label, children }: { label: string; children: ReactNode }) => {
	return (
		<>
			<div className="flex flex-col items-center last:mb-0 mb-3">
				<label className="text-xs">{label}</label>
				<div>{children}</div>
			</div>
		</>
	);
};
