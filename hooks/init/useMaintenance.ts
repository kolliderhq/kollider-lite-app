import React from 'react';

import { useRouter } from 'next/router';
import { useAppSelector } from 'hooks';


export default function useMaintenance() {
	const history = useRouter();
	// const isMaintenance = useAppSelector(state => state.layout.isMaintenance);
	const isMaintenance = useAppSelector(state => state.layout.isMaintenance);

	React.useEffect(() => {
		console.log(isMaintenance)
		if (!isMaintenance || history?.pathname === '/maintenance') return;
		history.push('/maintenance');
	}, [isMaintenance, history]);
}