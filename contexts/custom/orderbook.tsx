/**
 * @desc same attempt as lastMatches
 * TODO : turn this into two classes, Orderbook.instance & flashes
 */

import React from 'react';

import empty from 'is-empty';
import each from 'lodash-es/each';
import map from 'lodash-es/map';
import toPlainObject from 'lodash-es/toPlainObject';

import { Orderbook } from 'classes/Orderbook';
import useIsWindowVisible from 'hooks/useIsWindowVisible';
import { useSymbols } from 'hooks/useSymbols';
import { createAccumulatedArray } from 'utils/complexSort';

export const useOrderbookData = () => {
	const { symbol } = useSymbols();
	const visibility = useIsWindowVisible();
	const [dummy, rerender] = React.useState(false);

	React.useEffect(() => {
		const listener = () => rerender(v => !v);
		Orderbook.instance.eventEmitter.on(symbol, listener);
		return () => Orderbook.instance.eventEmitter.removeListener(symbol, listener);
	}, [symbol]);

	const shouldUpdate = visibility ? dummy : '';
	return React.useMemo(() => {
		return Orderbook.instance.proxyOrderbook[`_${symbol}`];
	}, [shouldUpdate, symbol]);
};

// compare the prevObj and newObj for changes and set the _flashObj to flash
const updateFlashes = (prevObj, newObj, symbol) => {
	// console.log('updateFlashes', prevObj, newObj);
	const compPrevObj = {};
	each([...prevObj.asks, ...prevObj.bids], v => (compPrevObj[v[0]] = v[1]));
	const new_flashObj = {};
	each([...newObj.asks, ...newObj.bids], v => {
		const [price, value] = v;
		if (!compPrevObj[price]) new_flashObj[price] = 1;
		else if (compPrevObj[price] !== value) {
			new_flashObj[price] = Orderbook.instance.flashObj[symbol][price]
				? Orderbook.instance.flashObj[symbol][price] + 1
				: 1;
		}
	});
	Orderbook.instance.updateFlashObj(symbol, new_flashObj);
};

export const useFlashData = () => {
	const [price, setPrice] = React.useState(null);
	const { symbol } = useSymbols();
	const visibility = useIsWindowVisible();
	const [dummy, rerender] = React.useState(false);

	React.useEffect(() => {
		const listener = () => rerender(v => !v);
		Orderbook.instance.eventEmitter.on(symbol, listener);
		return () => Orderbook.instance.eventEmitter.removeListener(symbol, listener);
	}, [symbol]);

	const shouldUpdate = visibility ? dummy : '';
	const ret = React.useMemo(() => Orderbook.instance.flashObj[symbol][price], [shouldUpdate, symbol, price]);

	return [ret, setPrice];
};

export const useSelectedOrderbookData = select => {
	const data = useOrderbookData();
	return React.useMemo(() => data[select], [data, select]);
};

export const useOrderbookSelector = selector => {
	const data = useOrderbookData();
	// console.log(data);
	const selectedData = selector(data);
	return React.useMemo(() => selectedData, [selectedData]);
};

export const setOrderbook = data => {
	const symbol = data.symbol;
	console.log('setOrderbook', data);
	Orderbook.instance.setOrderbookSnapshot(
		{
			asks: data.asks,
			bids: data.bids,
			mid: data.mid,
			asksTotal: data.asksTotal,
			bidsTotal: data.bidsTotal,
		},
		symbol
	);
};

export const batchProcessOrder = async (updateData, symbol) => {
	//	copy data so that it is clearable
	const updateDataArr = [...updateData];
	const data = { ...Orderbook.instance.proxyOrderbook[symbol] };

	let newData;
	newData = batchOrderbookUpdator(data, updateDataArr);

	if (empty(updateDataArr)) return;
	calcAccum(newData);
	updateFlashes(toPlainObject(Orderbook.instance.proxyOrderbook[symbol]), newData, symbol);

	Orderbook.instance.setOrderbookSnapshot(newData, symbol);
};

// cannot use functions from other packages - throws errors
const batchOrderbookUpdator = (targetObj, updateArr) => {
	const mergedArr = { asks: [], bids: [] };
	updateArr.forEach(update => {
		if (update.asks.length !== 0) update.asks.forEach(v => mergedArr.asks.push(v));
		if (update.bids.length !== 0) update.bids.forEach(v => mergedArr.bids.push(v));
	});
	['asks', 'bids'].forEach(side => {
		mergedArr[side].forEach(data => {
			const price = data[0];
			const volume = data[1];
			const target = targetObj[side];
			const indexKey = target.findIndex(v => {
				return Number(v[0]) === Number(price);
			});
			if (indexKey !== -1) {
				if (volume === 0) target.splice(indexKey, 1);
				else target[indexKey][1] = volume;
			} else {
				if (volume === 0) return;
				if (target) target.push([price, volume]);
				else targetObj = [[price, volume]];
			}
		});
	});
	targetObj.asks.sort((x, y) => Number(y[0]) - Number(x[0]));
	targetObj.bids.sort((x, y) => Number(y[0]) - Number(x[0]));

	//	if asks and bids exist, calculate mid value. Otherwise mid value is null
	if (targetObj.asks.length !== 0 && targetObj.bids.length !== 0) {
		const newMid =
			Math.round(
				((Number(targetObj.asks?.[targetObj.asks?.length - 1]?.[0]) + Number(targetObj.bids?.[0]?.[0])) / 2) * 100000
			) / 100000;
		if (targetObj.mid && newMid !== targetObj.mid) {
			targetObj.prevMid = targetObj.mid;
		}
		targetObj.mid = newMid;
	} else targetObj.mid = null;
	return targetObj;
};

// unpure function, creates the accumulated arrays and mid price
const calcAccum = state => {
	const askAccumArr = createAccumulatedArray(
		map(state.asks, arr => arr[1]),
		true
	);
	each(state.asks, (v, i) => {
		v[2] ? (v[2] = askAccumArr[i]) : v.push(askAccumArr[i]);
	});
	const bidAccumArr = createAccumulatedArray(
		map(state.bids, arr => arr[1]),
		false
	);
	each(state.bids, (v, i) => {
		v[2] ? (v[2] = bidAccumArr[i]) : v.push(bidAccumArr[i]);
	});
	state.asksTotal = !empty(askAccumArr) ? askAccumArr[0] : 0;
	state.bidsTotal = !empty(bidAccumArr) ? bidAccumArr[bidAccumArr.length - 1] : 0;
};
