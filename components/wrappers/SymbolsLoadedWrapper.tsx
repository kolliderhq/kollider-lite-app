import { useSymbols } from 'hooks';

export const SymbolsLoadedWrapper = ({ children }) => {
	const { symbol, symbolData } = useSymbols();
	const sData = symbolData[symbol];
	return <>{sData ? children : null}</>;
};
