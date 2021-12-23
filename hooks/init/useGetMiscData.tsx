import * as React from 'react';

import { sort } from 'fast-sort';
import findIndex from 'lodash-es/findIndex';
import keys from 'lodash-es/keys';
import useSWR from 'swr';

import { orderbook } from 'classes/Orderbook';
import { API_NAMES } from 'consts/api';
import { addSymbols, setSymbolData, setSymbolIndex } from 'contexts/modules/symbols';
import { useAppDispatch, useAppSelector } from 'hooks/redux';
import { getSWROptions } from 'utils/fetchers';

import { setInitSymbols } from '../../contexts/modules/invoices';
import { setSymbolLoad } from '../../contexts/modules/misc';

// import { displayToast } from 'utils/toast';

// fetch data that's only fetched once on init
export default function useGetMiscData() {
	const dispatch = useAppDispatch();
	const [symbolLoad, storedSymbolArr] = useAppSelector(state => [state.misc.symbolLoad, state.symbols.symbols]);
	const { data, error } = useSWR([API_NAMES.PRODUCTS], getSWROptions(API_NAMES.PRODUCTS));

	React.useEffect(() => {
		if (!data) return;
		const symbolArr = [...Array.from(new Set(['BTCUSD.PERP', ...sort(keys(data)).asc(v => v)]))];
		dispatch(setInitSymbols(symbolArr));
		dispatch(addSymbols(symbolArr));

		// init ohlc store with symbols
		orderbook.updateOrderbookSymbols(symbolArr);

		//	defer to end
		setTimeout(() => dispatch(setSymbolData(data)), 0);
	}, [data, dispatch]);

	React.useEffect(() => {
		if (symbolLoad === '' || storedSymbolArr.length === 1) return;
		const found = findIndex(storedSymbolArr, symbol => symbol === symbolLoad);
		if (found !== -1) {
			dispatch(setSymbolIndex(found));
		} else {
			// TODO : do toasts
			// displayToast(
			// 	<p className="test-sm">
			// 		Symbol - [{symbolLoad}]
			// 		<br /> was not found
			// 	</p>,
			// 	'error'
			// );
		}
		dispatch(setSymbolLoad(''));
	}, [symbolLoad, storedSymbolArr]);
}
