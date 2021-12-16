import { ReactNode } from 'react';

import { Footer } from 'components/Footer';

export const PageWrapper = ({ children }: { children: ReactNode }) => {
	return (
		<div className="max-w-sm min-w-xxs mx-auto min-h-screen">
			<div className="w-full min-h-screen">{children}</div>
			<Footer />
		</div>
	);
};
