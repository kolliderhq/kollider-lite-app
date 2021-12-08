import 'styles/tailwind.scss';
import 'styles/globals.scss';

import React from 'react';
import { Provider } from 'react-redux';

import { DefaultSeo } from 'next-seo';
import type { AppProps } from 'next/app';
import SWRConfig from 'swr/dist/utils/config-context';

import reduxStore from 'contexts/store';
import { googleTranslateException } from 'utils/misc';

import { DataInit } from '../components/DataInit';
import { PageWrapper } from '../components/PageWrapper';
import { defaultOnErrorRetry, fetcher } from '../utils/fetchers';

function MyApp({ Component, pageProps }: AppProps) {
	const init = React.useMemo(() => <DataInit />, []);
	return (
		<Provider store={reduxStore}>
			<SWRConfig
				value={{
					refreshInterval: 0,
					fetcher: fetcher,
					onErrorRetry: defaultOnErrorRetry,
				}}>
				<DefaultSeo
					title="Kollider Pro Exchange"
					description="Instant Derivative Trading. Access any asset with Bitcoin simply and fast."
					canonical={'pro.kollider.xyz'}
					twitter={{
						handle: '@kollider_trade',
						// site: '@site',
						cardType: 'summary_large_image',
					}}
				/>
				{init}
				<PageWrapper>
					<Component {...pageProps} />
				</PageWrapper>
			</SWRConfig>
		</Provider>
	);
}

googleTranslateException();

export default MyApp;
