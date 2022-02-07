import cn from 'clsx';
// import useDenoms from 'components/hooks/useDenoms';
import empty from 'is-empty';
import isObject from 'lodash-es/isObject';

import { TBigInput, divide, fixed, multiply } from 'utils/Big';
import { setAmountStyle } from 'utils/format';

export function DisplayNumber({
	amount = 0,
	sizeInt = 12,
	className,
	style,
	dataCy = undefined,
	leadingNone,
}: {
	amount?: TBigInput;
	sizeInt?: number;
	className?: string;
	style?: React.CSSProperties;
	dataCy?: string;
	leadingNone?: boolean;
}) {
	return (
		<p
			data-cy={dataCy}
			style={{ ...style, fontSize: `${sizeInt}px` }}
			className={cn(
				'overflow-visible whitespace-nowrap truncate nowrap h-fit',
				className ? className : 'text-gray-100',
				leadingNone ? 'leading-none' : 'leading-tight'
			)}
			dangerouslySetInnerHTML={setAmountStyle(amount, sizeInt, sizeInt, null, null)}
		/>
	);
}

// const cycleDenoms = currentDenom => {
// 	if (currentDenom === 'SATS') {
// 		updateSettingsStore({ denom: 'BTC' });
// 	} else if (currentDenom === 'BTC') {
// 		updateSettingsStore({ denom: 'USD' });
// 	} else {
// 		updateSettingsStore({ denom: 'SATS' });
// 	}
// };

export default function DisplayAmount({
	dataCy = undefined,
	amount = 0,
	textClass = 'text-gray-100',
	sizeInt = 14,
	sizeDenom = 12,
	decimals = 0,
	denom,
	wrapperClass = '',
	divideBy = 1,
	wrap = false,
	leadingNone = false,
	style = {},
	denomClass,
}: {
	dataCy?: string;
	amount: TBigInput;
	textClass?: string;
	sizeInt?: number;
	sizeDenom?: number;
	decimals?: number;
	denom?: string;
	wrapperClass?: string;
	divideBy?: number;
	wrap?: boolean;
	leadingNone?: boolean;
	style?: React.CSSProperties;
	denomClass?: string;
}) {
	// const [userDenom, denomMult, userDecimal] = useDenoms(denom);
	// const actualMult = userDenom ? denomMult : 1;
	// const actualDenom = userDenom && denom === 'SATS' ? userDenom : (denom as string);
	if (isObject(amount)) {
		return <p>Amount is Object</p>;
	} else if (empty(amount) && amount !== 0) {
		if (process.env.NODE_ENV !== 'production') {
			throw new Error(`Amount error >>> ${amount}`);
		}
	}
	return (
		<button
			onClick={() => {}}
			style={style}
			className={cn('overflow-visible h-fit w-fit', wrapperClass, {
				'whitespace-nowrap': !wrap,
			})}>
			<p
				data-cy={dataCy}
				style={{ fontSize: `${sizeInt}px` }}
				className={cn(
					'overflow-visible whitespace-nowrap truncate h-fit ',
					leadingNone ? 'leading-none' : 'leading-tight',
					textClass,
					wrap ? 'wrap break-all' : 'nowrap'
				)}
				// dangerouslySetInnerHTML={setAmountStyle(
				// 	fixed(multiply(divide(amount, divideBy), actualMult), userDecimal ? userDecimal : decimals),
				// 	sizeInt,
				// 	sizeInt,
				// 	actualDenom,
				// 	sizeDenom,
				// 	denomClass
				// )}
			/>
		</button>
	);
}
