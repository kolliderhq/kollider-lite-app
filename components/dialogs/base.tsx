import React, { FunctionComponent } from 'react';

import { Dialog } from '@headlessui/react';
import dynamic from 'next/dynamic';

import useElementDimensions from 'hooks/useElementDimentions';
import useWindowSize from 'hooks/useWindowSize';

const Portal = dynamic(import('components/Portal'), { ssr: false });

export interface BaseDialogProps {
	dialogStyle?: Record<string, string>;
	isOpen: boolean;
	close?: () => void;
	isHideCloseButton?: boolean;
	initialFocus?: React.MutableRefObject<HTMLElement | null>;
}

export const BasePopup: FunctionComponent<BaseDialogProps> = ({
	isOpen,
	close = () => {},
	children,
	dialogStyle,
	isHideCloseButton,
	initialFocus,
}) => {
	return (
		<Portal id={'popup'}>
			{isOpen ? (
				<div className="fixed inset-0 z-100 overflow-y-auto">
					<div className="p-5 flex items-center justify-center min-h-screen">
						<div className="fixed inset-0 w-full h-full bg-black opacity-25" onClick={() => close()} />
						<ModalAutoSizer>
							<div
								style={dialogStyle}
								className="relative z-100 max-w-sm min-w-xxxs sm:my-5 px-4 py-5 sm:py-10 md:p-8 bg-gray-950 shadow-elevation-24dp rounded-lg z-10"
							>
								{children}
								{!isHideCloseButton && (
									<img
										onClick={() => close()}
										className="absolute cursor-pointer top-3 sm:top-5 right-3 sm:right-5 w-8 sm:w-10"
										src="/assets/common/close.svg"
									/>
								)}
							</div>
						</ModalAutoSizer>
					</div>
				</div>
			) : null}
		</Portal>
	);
};

export const BaseDialog: FunctionComponent<BaseDialogProps> = ({
	isOpen,
	close = () => {},
	children,
	dialogStyle,
	isHideCloseButton,
	initialFocus,
}) => {
	return (
		<Portal id="dialog">
			{isOpen ? (
				<div className="fixed inset-0 z-100 overflow-y-auto">
					<div className="p-5 flex items-center justify-center min-h-screen">
						<div className="fixed inset-0 w-full h-full" onClick={() => close()} />
						<ModalAutoSizer>
							<div
								style={dialogStyle}
								className="max-w-sm min-w-xxxs px-4 py-5 sm:py-10 md:p-8 bg-gray-950 shadow-elevation-container rounded-lg z-10"
							>
								{children}
								{!isHideCloseButton && (
									<img
										onClick={() => close()}
										className="absolute cursor-pointer hover:opacity-80 top-3 sm:top-5 right-3 sm:right-5 w-8 sm:w-10"
										src="/assets/common/close.svg"
									/>
								)}
							</div>
						</ModalAutoSizer>
					</div>
				</div>
			) : null}
		</Portal>
	);
};

export const WrapBasePopup: FunctionComponent<BaseDialogProps> = props => {
	return (
		<BasePopup
			isOpen={props.isOpen}
			dialogStyle={props.dialogStyle}
			close={props.close}
			isHideCloseButton={props.isHideCloseButton}
			initialFocus={props.initialFocus}
		>
			{props.isOpen ? props.children : null}
		</BasePopup>
	);
};

export const WrapBaseDialog: FunctionComponent<BaseDialogProps> = props => {
	return (
		<BaseDialog
			isOpen={props.isOpen}
			dialogStyle={props.dialogStyle}
			close={props.close}
			isHideCloseButton={props.isHideCloseButton}
			initialFocus={props.initialFocus}
		>
			{props.isOpen ? props.children : null}
		</BaseDialog>
	);
};

export const ModalAutoSizer = ({ children }) => {
	const ref = React.useRef();
	const { width, height } = useElementDimensions(ref);
	const { width: windowWidth, height: windowHeight } = useWindowSize();

	const [widthMult, setWidthMult] = React.useState(1);
	const [margin, setMargin] = React.useState(null);

	React.useEffect(() => {
		if (!width || !windowWidth) return;
		if (width > windowWidth) {
			setWidthMult((windowWidth / width) * 0.96);
		}
	}, [width, windowWidth]);

	React.useEffect(() => {
		if (!height || !windowHeight) return;
		if (height > windowHeight) {
			setMargin(height - windowHeight + 10);
		}
	}, [height, windowHeight]);
	return (
		<section
			role="presentation"
			className="h-full relative z-100"
			style={{
				transform: `scale(${widthMult}, ${widthMult})`,
				marginTop: margin ? `${margin}px` : '',
			}}
			ref={ref}
		>
			{children}
		</section>
	);
};
