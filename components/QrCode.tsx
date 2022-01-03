import React from 'react';

import cn from 'clsx';
import QrDisplay from 'qrcode.react';

export function QrCode({
	autoClick = false,
	wrapperClass,
	value,
	size = 128,
	imageSettings,
}: {
	autoClick?: boolean;
	wrapperClass?: string;
	value: string;
	size?: number;
	imageSettings?: Record<string, string>;
}) {
	const ref = React.useRef<HTMLAnchorElement>();
	React.useEffect(() => {
		if (!value || !ref.current) return;
		//	clicks qr code if doesn't have webln and is mobile. For wallets like bluewallet
		if (!autoClick) return;
		// ref.current.dispatchEvent(new MouseEvent(`click`, { bubbles: true, cancelable: true, view: window }));
	}, [value, autoClick]);
	return (
		<div className={cn(wrapperClass)}>
			<a ref={ref} download target="_blank" href={`lightning:${value}`} rel="noreferrer">
				<QrDisplay size={size} value={value} imageSettings={imageSettings} includeMargin={false} />
			</a>
		</div>
	);
}
