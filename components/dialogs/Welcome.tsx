import React from 'react';

import { QrCode } from 'components/QrCode';

export const WelcomeDialog = () => {
	return (
		<div className="w-full h-full my-auto">
			<div className="flex flex-col items-center">
				<h2 className="tracking-wider mb-3">Welcome</h2>
				<div className="mx-auto max-w-xxxs w-full px-4 mt-4 border border-gray-600 rounded-lg bg-gray-900 py-4">
					<p className="text-sm">👋 Welcome to Kollider</p>
					<p className="text-xs pt-2">
						No need to deposit,
						<br />
						we settle right from your wallet
					</p>
				</div>
			</div>
		</div>
	);
};
