import { ReactNode } from 'react';

import { useSymbols } from 'hooks';

export const SymbolsLoadedWrapper = ({ children, loader }: { children: ReactNode; loader?: ReactNode }) => {
	const { symbol, symbolData } = useSymbols();
	const sData = symbolData[symbol];
	return <>{sData ? children : loader}</>;
};
