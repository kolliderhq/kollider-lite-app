import React from 'react';

import { useMarkPrice } from 'components/DisplaySymbol';
import { DefaultLoader } from 'components/Loader';
import { useSymbols } from 'hooks';

export const DisplayMarkPrice = () => {
	const { symbol } = useSymbols();
	const markPrice = useMarkPrice(symbol);
	return (
		<div className="h-full flex items-center w-full">
			{markPrice ? (
				<h2 className="w-full xxs:text-left text-right text-3xl xxs:text-2xl xs:text-3xl h-9">${markPrice}</h2>
			) : (
				<DefaultLoader wrapperClass={'h-9 flex items-center'} loaderSize={20} />
			)}
		</div>
	);
};
