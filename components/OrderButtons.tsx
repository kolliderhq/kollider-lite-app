import React from 'react';

import cn from 'clsx';

export const OrderButtons = () => {
	return (
		<section className="w-full grid grid-cols-2 h-12 gap-4">
			<button
				onClick={() => {}}
				className={cn(
					'border border-transparent rounded flex justify-center items-center s-transition-all bg-green-600 hover:opacity-80'
				)}>
				<p>Buy / LONG</p>
			</button>
			<button
				onClick={() => {}}
				className={cn(
					'border border-transparent rounded flex justify-center items-center s-transition-all bg-red-500 hover:opacity-80'
				)}>
				<p>Sell / SHORT</p>
			</button>
		</section>
	);
};
