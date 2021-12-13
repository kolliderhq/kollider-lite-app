import React from 'react';

import map from 'lodash-es/map';

import { UI } from 'consts/misc/UI';
import { useAppSelector } from 'hooks/redux';

export function useSymbols() {
	const { symbols, symbolIndex, symbolData } = useAppSelector(state => state.symbols);
	const symbolsDisplay = React.useMemo(() => map(symbols, v => v.split('.')?.[0]), [symbols]);
	const symbolsAssets = React.useMemo(
		() => map(symbolsDisplay, v => UI.RESOURCES.getSymbol(v.substring(0, 3))),
		[symbolsDisplay]
	);

	return React.useMemo(
		() => ({ symbols, symbolData, symbol: symbols[symbolIndex], symbolsDisplay, symbolsAssets, symbolIndex }),
		[symbols, symbolData, symbolsDisplay, symbolsAssets, symbolIndex]
	);
}

export function useSymbolPriceDp() {
	const { symbols, symbolData, symbolIndex } = useAppSelector(state => state.symbols);
	const symbol = symbols[symbolIndex];
	return symbolData[symbol]?.priceDp;
}
