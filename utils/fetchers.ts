import axios from 'axios';
import empty from 'is-empty';
import each from 'lodash-es/each';
import isArray from 'lodash-es/isArray';
import map from 'lodash-es/map';
import merge from 'lodash-es/merge';
import Router from 'next/router';

import { API } from 'consts/api';
import { postRequest } from 'utils/api';
import { LOG, LOG3, LOG4 } from 'utils/debug';
import { CustomError } from 'utils/error';
import { apiRefiner } from 'utils/refiners/api';

/**
 * Never throws
 * @param args
 * @returns {Q.Promise<any> | undefined | Promise<void> | *}
 */
export const alwaysSuccessFetcher = (...args) => {
	const [apiName, ...params] = args;
	const [method, urls] = makeFetchParams(apiName, ...params);
	if (urls.length === 1)
		return axios[method](urls[0])
			.then(res => {
				const ret = apiRefiner(apiName, res.data);
				if (ret?.errObj) {
					return Promise.reject(ret);
				} else {
					return Promise.resolve(ret);
				}
			})
			.catch(ex => {
				LOG3(ex?.response, `[FetchError - ${apiName}]`);
				return { error: true, data: ex?.response };
			});

	//  multiple urls
	const promises = [];
	each(urls, url =>
		promises.push(
			new Promise((resolve, reject) => {
				axios[method](url)
					.then(res => {
						resolve(res.data);
					})
					.catch(ex => {
						LOG3(ex, `[FetchError - ${apiName}`);
						resolve(new CustomError('Fetch Error', ex));
					});
			})
		)
	);
	return Promise.all(promises)
		.then(results => {
			return apiRefiner(apiName, results);
		})
		.catch(ex => {
			return new CustomError('Fetch Error', ex);
		});
};

export const simpleFetch = (...args) => {
	LOG(args, 'Api simple fetch');
	if (API.API[args[0]].method === 'post') return postRequest(...args);
	const [apiName, ...params] = args;
	const [method, urls] = makeFetchParams(apiName, ...params);
	if (urls.length === 1) {
		return axios[method](urls[0])
			.then(res => {
				return res.data;
			})
			.catch(ex => {
				if (ex?.name === 'CustomError') {
					throw ex;
				} else {
					throw new CustomError('Fetch Error', ex);
				}
			});
	}
	return;
};

/**
 * default fetcher for useSWR defined in top index.ts
 * @param args
 * @returns {Promise<unknown[]>|Q.Promise<any>|Promise<postcss.Result>|Promise<void>|*|undefined}
 */
export const fetcher = (...args) => {
	// LOG(args, 'Api fetch');
	if (API.API[args[0]].method === 'post') return postRequest(...args);
	const [apiName, ...params] = args;
	const [method, urls] = makeFetchParams(apiName, ...params);
	return axios[method](urls[0])
		.then(res => {
			return apiRefiner(apiName, res.data);
		})
		.catch(ex => {
			if (ex?.name === 'CustomError') {
				throw ex;
			} else {
				if (ex.response?.status === 401) {
					if (ex.response.data.error === 'Expired') {
						// TODO
						//  logic for expired token

						Router.reload();
					}
				}
				throw new CustomError('Fetch Error', ex);
			}
		});
};

/**
 * Creates fetch params to pass to useSWR
 * @param apiName
 * @param params
 * @returns {[string, array, *, *]|*}
 */
export const makeFetchParams = (apiName, ...params) => {
	if (empty(API.API[apiName])) throw new Error(`${apiName} does not exist`);
	const api = API.API[apiName];
	const base = api?.base;
	if (!base) throw new CustomError(`api base does not exist for api [${apiName}]`);
	const route = api.route(...params);
	const urls = isArray(route) ? map(route, v => `${base}${v}`) : [`${base}${route}`];
	return [api.method ? api.method : 'get', urls, apiName];
};

export const makeFetchUrl = (apiName, ...params) => {
	if (empty(API.API[apiName])) throw new Error(`${apiName} does not exist`);
	const api = API.API[apiName];
	const base = api?.base;
	if (!base) throw new Error(`api base does not exist for api [${apiName}]`);
	const route = api.route(...params);
	return `${base}${route}`;
};

export const getSWROptions = apiName => {
	const ret = {
		revalidateOnFocus: false,
		refreshInterval: API.API[apiName]?.stale,
		dedupingInterval: API.API[apiName]?.stale,

		// examples of customOptions https://swr.vercel.app/docs/options
		// getInitData: Api.Api[apiName]?.initData,
		// onErrorRetry: Api.Api[apiName]?.onErrorRetry,
		// shouldRetryOnError: Api.Api[apiName]?.shouldRetryOnError,
	};
	if (API.API[apiName]?.customOptions) {
		merge(ret, API.API[apiName].customOptions);
	}
	return ret;
};

export const defaultOnErrorRetry = (error, key, config, revalidate, { retryCount }) => {
	// Never retry on 404.
	if (error.status === 404) {
		try {
			const parsedKeys = key.split('@');
			LOG4(`${parsedKeys[1]} - ${error?.statusText}`, 'Api 404');
			// TODO : do error handling
			// displayToast(`${parsedKeys[1]}`, 'error', { position: 'top-right' }, 'Api 404');
		} catch (ex) {
			console.error(ex);
			LOG4(`${key} - ${error?.statusText}`, 'Api 404');
			// TODO : do error handling
			// displayToast(`${key}`, 'error', { position: 'top-right' }, 'Api 404');
		}
		return;
	}
	// Only retry up to 10 times.
	if (retryCount >= 10) return;
	// Retry after 5 seconds.
	setTimeout(() => revalidate({ retryCount: retryCount + 1 }), 5000);
};
