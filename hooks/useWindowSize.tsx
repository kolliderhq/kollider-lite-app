import React from 'react';

export default function useWindowSize() {
	const [windowSize, setWindowSize] = React.useState(getSize);

	React.useEffect(() => {
		if (!isClient) {
			return;
		}

		function handleResize() {
			setWindowSize(getSize());
		}

		window.addEventListener('resize', handleResize);
		return () => {
			window.removeEventListener('resize', handleResize);
		};
	}, []); // Empty array ensures that effect is only run on mount and unmount

	return windowSize;
}

const isClient = typeof window === 'object';

const getSize = () => {
	return {
		width: isClient ? window.innerWidth : undefined,
		height: isClient ? window.innerHeight : undefined,
	};
};
