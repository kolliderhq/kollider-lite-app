import React from 'react';
import { SwipeableProps, useSwipeable } from 'react-swipeable';

import { TABS } from 'consts';
import { reduxStore, storeDispatch } from 'contexts';
import { setTab } from 'contexts/modules/layout';

const swipeConfig = {
	delta: 50, // min distance(px) before a swipe starts
	preventDefaultTouchmoveEvent: false, // call e.preventDefault *See Details*
	trackTouch: true, // track touch input
	trackMouse: false, // track mouse input
	rotationAngle: 0, // set a rotation angle
};

export const useSwipeActions = () => {
	const swipeOptions = React.useMemo(() => {
		return {
			onSwipedRight: eventData => {
				console.log('onSwipedRight', eventData);
				if (eventData.velocity < 0.5) return;
				const selectedTab = reduxStore.getState().layout.selectedTab;
				if (selectedTab === TABS.ORDER) storeDispatch(setTab(TABS.__LENGTH - 1));
				else storeDispatch(setTab(selectedTab - 1));
			},
			onSwipedLeft: eventData => {
				console.log('onSwipedLeft', eventData);
				if (eventData.velocity < 0.5) return;
				const selectedTab = reduxStore.getState().layout.selectedTab;
				if (selectedTab === TABS.__LENGTH - 1) storeDispatch(setTab(TABS.ORDER));
				else storeDispatch(setTab(selectedTab + 1));
			},
			...swipeConfig,
		} as SwipeableProps;
	}, []);

	const handlers = useSwipeable(swipeOptions);
	return handlers;
};
