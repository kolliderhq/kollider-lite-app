import React from 'react';

import { NextSeo } from 'next-seo';
import Image from 'next/image';
import { useRouter } from 'next/router';

import { useAppSelector } from 'hooks';

export default function Maintenance() {
	const history = useRouter();
	const isMaintenance = useAppSelector(state => state.layout.isMaintenance);

	React.useEffect(() => {
		if (isMaintenance) return;
		history.push('/');
	}, [history, isMaintenance]);

	return (
		<>
			<NextSeo title="Maintenance" />
			<section className="relative w-full h-full">
				<figure className="absolute left-0 top-0 flex items-center my-3">
					<Image alt="logo" src="/kollider_icon_white.png" width={75} height={45} />
					<h3>Kollider Pro</h3>
				</figure>
				<section className="h-full w-full flex flex-col items-center justify-center min-h-screen">
					<div className="flex items-center">
						<Image
							alt="spanner"
							className="s-filter-white mr-2"
							src="/assets/misc/maintenance.svg"
							width={75}
							height={75}
						/>
						<h1 className="text-5xl ">Maintenance</h1>
					</div>
					<p className="mt-5 text-gray-300">We are currently undergoing a scheduled maintenance</p>
					{/* <p
						onClick={() => window.open(MISC.LINKS.LANDING)}
						className="underline cursor-pointer hover:opacity-75 mt-10">
						Go to Kollider website
					</p> */}
				</section>
			</section>
		</>
	);
}
