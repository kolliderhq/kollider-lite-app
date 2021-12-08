import React from 'react';

import Img from 'next/image';

import { OrderButtons } from 'components/OrderButtons';
import { OrderInputs } from 'components/OrderInputs';

export default function Home() {
	return (
		<div className="w-full">
			<figure className="w-full h-20 flex items-center justify-center">
				<Img width={240} height={60} src={'/assets/logos/kollider_logo_white.png'} />
			</figure>
			<OrderInputs />
			<OrderButtons />
		</div>
	);
}
