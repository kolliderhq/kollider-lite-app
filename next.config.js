/** @type {import('next').NextConfig} */
const path = require('path');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
	enabled: process.env.ANALYZE === 'true',
});
module.exports = withBundleAnalyzer({
	webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
		// Note: we provide webpack above so you should not `require` it
		// Perform customizations to webpack config

		// Important: return the modified config

		config.module.rules.push({
			test: /\.worker\.(c|m)?js$/i,
			loader: 'worker-loader',
			options: {
				worker: 'SharedWorker',
			},
		});

		return config;
	},
	swcMinify: true,
	reactStrictMode: true,
	trailingSlash: false,
	webpackDevMiddleware: config => {
		config.watchOptions = {
			poll: 1000,
			aggregateTimeout: 300,
		};
		return config;
	},
	sassOptions: {
		includePaths: [path.join(__dirname, 'styles')],
	},
	images: {
		domains: ['raw.githubusercontent.com'],
	},
	eslint: {
		ignoreDuringBuilds: true,
	},
});
