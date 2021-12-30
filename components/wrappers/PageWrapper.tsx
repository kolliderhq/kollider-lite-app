import 'react-toastify/dist/ReactToastify.css';

import React, { ReactNode } from 'react';

import { Footer } from 'components/Footer';
import { ToastContainer } from 'components/ToastContainer';

export const PageWrapper = ({ children }: { children: ReactNode }) => {
	return (
		<div className="max-w-sm min-w-xxxs mx-auto min-h-screen">
			<div className="w-full min-h-screen">{children}</div>
			<Footer />
			<ToastContainer />
		</div>
	);
};
