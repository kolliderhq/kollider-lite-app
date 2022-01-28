import React, { ReactNode } from 'react';

import cn from 'clsx';

export const LabelledValue = ({
	smallLabel,
	label,
	value,
	className,
	coloured,
	actualValue,
}: {
	smallLabel?: string;
	label: string;
	value: string | ReactNode;
	className?: string;
	coloured?: boolean;
	actualValue?: string; //	for colouring the value according to the actual value
}) => {
	return (
		<div className={cn('flex flex-col items-center justify-center h-[50px] xxs:h-15', className)}>
			<p className="text-[8px] leading-none text-gray-600 mb-0.5 sm:mb-0">{smallLabel}</p>
			<p className="leading-none tracking-tight text-xs sm:text-sm text-gray-400 text-center mb-1 sm:mb-0.5">{label}</p>
			<p
				className={cn(
					coloured &&
						value !== '-' &&
						(Number(actualValue ? actualValue : value) < 0 ? 'text-red-400' : 'text-green-400'),
					'leading-none tracking-normal text-base sm:leading-none sm:text-lg text-right'
				)}
			>
				{value}
			</p>
		</div>
	);
};
