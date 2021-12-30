import { Flip, ToastContainer as ToastifyContainer, cssTransition } from 'react-toastify';

const transition = cssTransition({
	enter: 'kollider__animate Toastify__flip-enter',
	exit: 'kollider__animate-fast Toastify__flip-exit',
	collapseDuration: 500,
});

export const ToastContainer = () => {
	return <ToastifyContainer transition={transition} />;
};
