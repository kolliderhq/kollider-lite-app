import React, { FunctionComponent } from 'react';

import { Dialog } from '@headlessui/react';

export interface BaseDialogProps {
	dialogStyle?: Record<string, string>;
	isOpen: boolean;
	close?: () => void;
	isHideCloseButton?: boolean;
	initialFocus?: React.MutableRefObject<HTMLElement | null>;
}

export const BaseDialog: FunctionComponent<BaseDialogProps> = ({
	isOpen,
	close = () => {},
	children,
	dialogStyle,
	isHideCloseButton,
	initialFocus,
}) => {
	return (
		<>
			{isOpen ? (
				<Dialog
					as="div"
					className="fixed inset-0 z-100 overflow-y-auto"
					open={isOpen}
					onClose={close}
					initialFocus={initialFocus}>
					<div className="p-5 flex items-center justify-center min-h-screen">
						<Dialog.Overlay className="fixed inset-0 bg-black opacity-50 z-90" />
						<div
							style={dialogStyle}
							className="relative w-4/5 max-w-sm min-w-xxs px-4 py-5 md:p-8 bg-surface shadow-elevation-24dp rounded-2xl z-10">
							{children}
							{!isHideCloseButton && (
								<img
									onClick={() => close()}
									className="absolute cursor-pointer top-3 sm:top-5 right-3 sm:right-5 w-8 sm:w-10"
									src="/assets/common/close.svg"
								/>
							)}
						</div>
					</div>
				</Dialog>
			) : null}
		</>
	);
};

export function wrapBaseDialog<C extends React.ElementType>(
	element: C
): React.ElementType<BaseDialogProps & React.ComponentProps<C>> {
	// eslint-disable-next-line react/display-name
	return props => {
		return (
			<BaseDialog
				isOpen={props.isOpen}
				dialogStyle={props.dialogStyle}
				close={props.close}
				isHideCloseButton={props.isHideCloseButton}
				initialFocus={props.initialFocus}>
				{props.isOpen ? React.createElement(element, props) : null}
			</BaseDialog>
		);
	};
}
