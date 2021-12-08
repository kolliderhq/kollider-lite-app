import { ISortByObjectSorter, sort } from 'fast-sort';
import keys from 'lodash-es/keys';
import map from 'lodash-es/map';
import reduce from 'lodash-es/reduce';
import reverse from 'lodash-es/reverse';

export const sortObjByKeys = (inputObj: Record<string, unknown>, sortBy: ISortByObjectSorter<any>[]) => {
	const objKeys = keys(inputObj);
	sort(objKeys).by(sortBy);
	return reduce(
		objKeys,
		(retArr, key) => {
			return [...retArr, [key, inputObj[key]]];
		},
		[]
	);
};

export const createAccumulatedArray = (arr: number[], reversed: boolean): number[] => {
	if (!reversed) {
		let sum = 0;
		return map(arr, v => {
			sum = sum + v;
			return sum;
		});
	} else {
		let sum = 0;
		return reverse(
			map(reverse(arr), v => {
				sum = sum + v;
				return sum;
			})
		);
	}
};
