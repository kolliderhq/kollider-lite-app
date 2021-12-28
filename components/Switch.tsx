import React from 'react';

export const Switch = ({ switchId }) => {
	return (
		<div className="flex items-center justify-center w-full">
			<label htmlFor="toggleB" className="flex items-center cursor-pointer">
				<div className="relative">
					<input type="checkbox" id="toggleB" className="sr-only" />
					<div className="block bg-gray-600 w-8 h-5 rounded-full"></div>
					<div className="dot absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition"></div>
				</div>
			</label>
		</div>
	);
};
