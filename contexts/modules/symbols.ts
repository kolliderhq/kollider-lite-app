import { PayloadAction, createSlice } from '@reduxjs/toolkit';

export interface ISymbolData {
	symbol: string;
	contractSize: string;
	maxLeverage: string;
	baseMargin: string;
	maintenanceMargin: string;
	isInversePriced: boolean;
	priceDp: number;
	underlyingSymbol: string;
	lastPrice: string;
	tickSize: string;
	riskLimit: string;
}

export type TSymbolData = Record<string, ISymbolData>;

interface StoreSymbolState {
	symbolData: TSymbolData;
	symbolIndex: number;
	symbols: string[];
}
const initialState: StoreSymbolState = {
	symbolData: {} as TSymbolData,
	symbolIndex: 0,
	symbols: ['BTCUSD.PERP'],
};

export const symbolSlice = createSlice({
	name: 'symbols',
	initialState,
	reducers: {
		setSymbolData: (state, action: PayloadAction<TSymbolData>) => {
			state.symbolData = action.payload;
		},
		addSymbols: (state, action: PayloadAction<string[]>) => {
			state.symbols = [...Array.from(new Set([...state.symbols, ...action.payload]))];
		},
		setSymbolIndex: (state, action: PayloadAction<number>) => {
			state.symbolIndex = action.payload;
		},
	},
});

export const { setSymbolData, setSymbolIndex, addSymbols } = symbolSlice.actions;
export default symbolSlice.reducer;
