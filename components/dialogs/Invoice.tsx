import React from 'react';

import cn from 'clsx';

import { wrapBasePopup } from 'components/dialogs/base';
import { setOnlyWeblnIfEnabled, setWeblnAutoWithdraw } from 'contexts';
import { useAppDispatch, useAppSelector } from 'hooks';

export const InvoicePopup = wrapBasePopup(() => {
	const dispatch = useAppDispatch();
	const { weblnAutoWithdraw, onlyWeblnIfEnabled } = useAppSelector(state => state.settings);

	return (
		<div className="w-full h-full mt-5">
			<h2 className="tracking-wider mb-3">
				<img className="inline mr-2 pb-1" width={28} height={28} src="/assets/common/lightning.svg" />
				Invoice
			</h2>
			<section className="container-spacious container-children-bottom-border mt-5">
				<div>asdf</div>
				<div>asdf</div>
				<div>asdf</div>
				<div>asdf</div>
			</section>
		</div>
	);
});
