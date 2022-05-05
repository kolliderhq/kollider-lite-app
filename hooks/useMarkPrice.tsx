import React from 'react';

import { useAppSelector } from 'hooks/redux';
import { useSymbols } from 'hooks/useSymbols';
import { fixed } from 'utils/Big';

export const useMarkPrice = symbol => {
	const { symbolData } = useSymbols();
	const priceDp = symbolData[symbol]?.priceDp;
	const markPriceObj = useAppSelector(state => state.prices.markPrices);
	console.log(markPriceObj)
	return React.useMemo(() => {
		if (markPriceObj[symbol] === '') return null;
		return fixed(markPriceObj[symbol], priceDp);
	}, [markPriceObj, symbol, priceDp]);
};
