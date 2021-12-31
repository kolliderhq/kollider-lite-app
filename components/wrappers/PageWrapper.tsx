import 'react-toastify/dist/ReactToastify.css';

import React, { ReactNode } from 'react';

import { Footer } from 'components/Footer';
import { ToastContainer } from 'components/ToastContainer';
import { useSwipeActions } from 'hooks/useSwipeActions';

export const PageWrapper = ({ children }: { children: ReactNode }) => {
	const swipeHandlers = useSwipeActions();
	return (
		<div {...swipeHandlers} className="max-w-sm min-w-xxxs mx-auto min-h-screen">
			<div className="w-full min-h-screen">{children}</div>
			<Footer />
			<ToastContainer />
		</div>
	);
};
