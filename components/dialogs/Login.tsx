import React from 'react';

import { wrapBaseDialog } from 'components/dialogs/base';
import { useAppSelector } from 'hooks';

export const Login = () => {
	const [open, setOpen] = React.useState(true);
	const [loggedIn, isWeblnConnected] = useAppSelector(state => [
		state.user.data.token !== '',
		state.connection.isWeblnConnected,
	]);
	return <LoginDialog isOpen={!loggedIn && open && !isWeblnConnected} close={() => setOpen(false)} />;
};

export const LoginDialog = wrapBaseDialog(() => {
	return (
		<div className="w-full ">
			<div />
		</div>
	);
});
