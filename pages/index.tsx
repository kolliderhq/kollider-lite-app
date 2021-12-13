import React from 'react';

import Img from 'next/image';

import { Login } from 'components/dialogs';
import { SymbolSelectDropdown } from 'components/Dropdown';
import { OrderArea } from 'components/OrderArea';

export default function Home() {
	return (
		<div className="w-full">
			<Login />
			<figure className="w-full h-20 flex items-center justify-center">
				<Img width={240} height={60} src={'/assets/logos/kollider_logo_white.png'} />
			</figure>
			<div className="container-default">
				<div className="flex items-center justify-center h-10 w-full mb-4">
					<div className="w-3/4 xs:w-1/2">
						<SymbolSelectDropdown />
					</div>
				</div>
				<OrderArea />
			</div>
		</div>
	);
}
