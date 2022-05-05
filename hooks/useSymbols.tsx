import React from 'react';

import map from 'lodash-es/map';

import { GENERAL } from 'consts';
import { UI } from 'consts/misc/UI';
import { ISymbolData, TSymbolData } from 'contexts';
import { useAppSelector } from 'hooks/redux';

export function useSymbols() {
	const { symbols, symbolIndex, symbolData } = useAppSelector(state => state.symbols);
	const symbolsDisplay = React.useMemo(() => map(symbols, v => v.split('.')?.[0]), [symbols]);
	const symbolsAssets = React.useMemo(
		() => map(symbolsDisplay, v => UI.RESOURCES.getSymbol(v.substring(0, 6))),
		[symbolsDisplay]
	);

	const symbolsAssetsMap = React.useMemo(() => {
		let m = {};
		symbols.map(sym => {
			m[sym] = UI.RESOURCES.getSymbol(sym.substring(0, 6))
		})
		return m
	}, [symbols]);

	return React.useMemo(
		() => ({ symbols, symbolData, symbol: symbols[symbolIndex], symbolsDisplay, symbolsAssets, symbolIndex, symbolsAssetsMap }),
		[symbols, symbolData, symbolsDisplay, symbolsAssets, symbolIndex, symbolsAssetsMap]
	) as {
		symbols: string[];
		symbolData: TSymbolData;
		symbol: string;
		symbolsDisplay: string[];
		symbolsAssets: string[];
		symbolIndex: number;
		symbolsAssetsMap: Map<string, string>;
	};
}

export function useSymbolData(inputSymbol?: string) {
	const { symbols, symbolData, symbolIndex } = useAppSelector(state => state.symbols);
	const symbol = inputSymbol ? inputSymbol : symbols[symbolIndex];
	return (symbolData[symbol] ? symbolData[symbol] : GENERAL.DEFAULT.OBJ) as ISymbolData;
}
