import React from 'react';

import { TriangleSpinner } from 'components/vendor/spinner';
import Img from 'react-cool-img';

export default function Loader({ text }: { text?: string }) {
	return (
		<div className="flex h-full w-full overflow-hidden">
			<div className="m-auto text-center">
				{text ? (
					<div className="grid grid-rows-2 gap-4">
						<div className="flex justify-center">
							<Img src={'kollider_loader.svg'} height={126} width={126} />
						</div>
						<div className="text-center">{text}</div>
					</div>
				) : (
					<Img src={'kollider_loader.svg'} height={126} width={126} />
				)}
			</div>
		</div>
	);
}

export const DefaultLoader = ({ loaderSize = 12, wrapperClass = '', style = {} }) => (
	<div className={wrapperClass} style={style}>
		<div className="s-loader" style={{ fontSize: `${loaderSize}px` }} />
	</div>
);
