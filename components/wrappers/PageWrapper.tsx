import 'react-toastify/dist/ReactToastify.css';

import React, { ReactNode } from 'react';

import { Footer } from 'components/layout/Footer';
import { ToastContainer } from 'components/layout/ToastContainer';
import { useSwipeActions } from 'hooks/useSwipeActions';

export const PageWrapper = ({ children }: { children: ReactNode }) => {
	const swipeHandlers = useSwipeActions();
	return (
		<div {...swipeHandlers} className="w-sm sm:w-full min-w-xxxs mx-auto min-h-screen">
			<div className="w-full min-h-screen">{children}</div>
			<Footer />
			<ToastContainer />
		</div>
	);
};
