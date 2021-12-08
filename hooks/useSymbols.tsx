import React from 'react';

import { UI } from 'constants/misc/UI';

import map from 'lodash-es/map';

import { useAppSelector } from 'hooks/redux';

export default function useSymbols() {
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
