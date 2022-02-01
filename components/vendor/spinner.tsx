export const TriangleSpinner = props => (
	<div className={'react-spinner-loader-svg'}>
		<svg id="triangle" width={props.width} height={props.height} viewBox="-3 -4 39 39" aria-label={props.label}>
			<polygon fill="transparent" stroke={props.color} strokeWidth="1" points="16,0 32,32 0,32" />
		</svg>
	</div>
);

export const BarLoader = props => (
	<div className={'react-spinner-loader-svg'}>
		<svg id="bar" width={props.width} height={props.height} viewBox="-3 -4 39 39" aria-label={props.label}>
			<polygon fill="transparent" stroke={props.color} strokeWidth="1" points="16,0 32,32 0,32" />
		</svg>
	</div>
);
