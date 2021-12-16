import React from 'react';

import Img from 'next/image';

import { Dialogs } from 'components/dialogs/DIalogs';
import { SymbolSelectDropdown } from 'components/Dropdown';
import { Header } from 'components/Header';
import { OrderArea } from 'components/OrderArea';
import { OrderInfo } from 'components/OrderInfo';

export default function Home() {
	return (
		<div className="w-full px-2 sm:px-4 pt-4">
			<Dialogs />
			<Header />
			<div className="flex items-center justify-end h-10 w-full mb-4">
				<div className="w-3/4 xs:w-1/2">
					<SymbolSelectDropdown />
				</div>
			</div>
			<div className="flex flex-col gap-4">
				<OrderArea />
				<OrderInfo />
			</div>
		</div>
	);
}
