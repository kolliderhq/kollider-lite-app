import Img from 'next/image';

import Loader from 'components/Loader';

export function MissingData({ text, dims }: { text?: string; dims?: number[] }) {
	return (
		<div className="w-full h-full flex flex-col items-center justify-center">
			<Img width={dims ? dims[0] : 50} height={dims ? dims[1] : 50} src={'/assets/common/notFound.svg'} />
			{text && <p>{text}</p>}
		</div>
	);
}
