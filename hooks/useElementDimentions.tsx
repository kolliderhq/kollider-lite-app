import React from 'react';

import each from 'lodash-es/each';

const initState = {
	height: null,
	width: null,
};

/**
 * @desc returns the dimensions of reffed element after render
 * @param ref
 * @returns {{width: null, height: null}}
 */
export default function useElementDimensions(ref) {
	const [dims, setDims] = React.useState(initState);

	React.useEffect(() => {
		if (!ref?.current) return;
		setDims(v => ({ ...v, height: ref.current?.offsetHeight, width: ref.current?.offsetWidth }));
	}, [ref.current?.offsetWidth, ref.current?.offsetHeight]);

	return dims;
}

export const useObservedElementDimensions = ref => {
	const [state, setState] = React.useState({ width: null, height: null });
	const observerRef = React.useRef<ResizeObserver>();
	React.useEffect(() => {
		const el = ref?.current;
		if (!el) return;
		// eslint-disable-next-line no-undef
		if (!observerRef?.current) observerRef.current = new ResizeObserver(entries => observeFunc(entries, setState));
		observerRef.current.observe(el);
	}, [ref?.current]);
	return state;
};

const observeFunc = (entries, cb) => {
	each(entries, entry => {
		if (entry.contentBoxSize) {
			cb({ width: entry.contentBoxSize[0], height: entry.contentBoxSize[1] });
		}
	});
};
