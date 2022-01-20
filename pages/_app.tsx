import 'styles/tailwind.scss';
import 'styles/globals.scss';
import 'styles/styles.scss';

import React from 'react';
import { Provider } from 'react-redux';

import PlausibleProvider from 'next-plausible';
import { DefaultSeo } from 'next-seo';
import type { AppProps } from 'next/app';
import { SWRConfig } from 'swr';

import { DataInit } from 'components/DataInit';
import { PageWrapper } from 'components/wrappers/PageWrapper';
import { reduxStore } from 'contexts/store';
import { defaultOnErrorRetry, fetcher } from 'utils/fetchers';
import { googleTranslateException } from 'utils/misc';

function MyApp({ Component, pageProps }: AppProps) {
	const init = React.useMemo(() => <DataInit />, []);
	return (
		<PlausibleProvider domain={'light.kollider.xyz'}>
			<Provider store={reduxStore}>
				<SWRConfig
					value={{
						refreshInterval: 0,
						fetcher: fetcher,
						onErrorRetry: defaultOnErrorRetry,
					}}>
					<DefaultSeo
						title="Kollider Lite"
						description="Instant Derivative Trading. Access any asset with Bitcoin simply and fast."
						canonical={'trade.kollider.xyz'}
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
		</PlausibleProvider>
	);
}

googleTranslateException();

export default MyApp;
