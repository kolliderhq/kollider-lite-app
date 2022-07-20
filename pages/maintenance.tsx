import React from 'react';

import { NextSeo } from 'next-seo';
import Image from 'next/image';
import { useRouter } from 'next/router';

import { useAppSelector } from 'hooks';
import Img from 'react-cool-img';

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
				<figure className="absolute left-0 top-0 flex items-center my-3 ml-6">
					<Img alt="logo" src="/assets/logos/kollider_icon_white.png" width={20} height={20} />
					<div className="text-lg ml-2">Kollider</div>
				</figure>
				<section className="h-full w-full flex flex-col items-center justify-center min-h-screen">
					<div className="text-4xl">⚠️</div>
					<div className="flex items-center">
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
