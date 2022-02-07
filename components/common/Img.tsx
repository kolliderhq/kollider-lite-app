import React from 'react';
import CoolImg from 'react-cool-img';

const retrySettings = { count: 0 };
export default function Img({
	src,
	style = {},
	className = '',
	onClick,
	placeholder = null,
	error = null,
	alt = 'img',
}: {
	src: string;
	style?: Record<string, string>;
	className?: string;
	onClick?: () => void;
	placeholder?: string;
	error?: string;
	alt?: string;
}) {
	return React.useMemo(
		() => (
			<CoolImg
				onClick={onClick}
				style={style}
				src={src}
				alt={alt}
				placeholder={placeholder ? placeholder : '/assets/common/loading-spin.svg'}
				error={error ? error : '/assets/common/missing-icon.svg'}
				className={className}
				retry={retrySettings}
			/>
		),
		[src, style, className, placeholder, error]
	);
}