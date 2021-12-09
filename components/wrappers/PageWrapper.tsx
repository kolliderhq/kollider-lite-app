import { ReactNode } from 'react';

export const PageWrapper = ({ children }: { children: ReactNode }) => {
	return (
		<div className="max-w-sm min-w-xxs mx-auto">
			<div className="w-full p-2 min-h-screen">{children}</div>
		</div>
	);
};
