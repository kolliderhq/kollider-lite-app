import React from 'react';

import { getHiddenVisChange } from 'utils/scripts';

export default function useIsWindowVisible() {
	const [visible, setVisible] = React.useState(true);

	React.useEffect(() => {
		const [hidden, visibilityChange] = getHiddenVisChange();
		function handleVisibilityChange() {
			if (document[hidden]) {
				setVisible(false);
			} else {
				setVisible(true);
			}
		}
		document.addEventListener(visibilityChange, handleVisibilityChange, false);
		return () => document.removeEventListener(visibilityChange, handleVisibilityChange);
	}, []);
	return visible;
}
