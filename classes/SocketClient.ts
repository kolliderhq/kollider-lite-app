import EventEmitter from 'events';

import empty from 'is-empty';
import difference from 'lodash-es/difference';
import each from 'lodash-es/each';
import isFunction from 'lodash-es/isFunction';
import isNil from 'lodash-es/isNil';
import isString from 'lodash-es/isString';
import noop from 'lodash-es/noop';
import toPlainObject from 'lodash-es/toPlainObject';
import WebSocket, { Options as WebSocketOptions } from 'reconnecting-websocket';

import { setInstantOrder } from 'contexts';
import { LOG, LOG2, LOG3, LOG4, LOG5 } from 'utils/debug';
import { OrderTemplate, ProcessedOrder } from 'utils/trading';

import { MESSAGE_TYPES, SOCKET_END_POINTS, WS } from '../consts';
import { setIsWsAuthenticated, setIsWsConnected } from '../contexts/modules/connection';
import { reduxStore, storeDispatch } from '../contexts/store';
import { bodyParamsValidation } from '../utils/api';
import { wsDataRefiner } from '../utils/refiners/sockets';

const defaultOptions = Object.freeze({
	maxReconnectionDelay: 1000,
	minReconnectionDelay: 1000,
	reconnectionDelayGrowFactor: 1.3,
	minUptime: 5000,
	connectionTimeout: 4000,
	maxRetries: Infinity,
	maxEnqueuedMessages: Infinity,
	startClosed: false,
	debug: false,
});

const BASE_WS_CLIENT = {
	name: 'client',
	base: SOCKET_END_POINTS.BACK,
	customOptions: {},
};

class SocketClient extends EventEmitter {
	private _localEmitter = new EventEmitter();
	private _socket: WebSocket | undefined;

	private _socketConnected = false;
	private _socketAuthenticated = false;

	private _channelMap = new Map(); //  keeps track of which channels are sub to which symbol
	private _clientOptions: typeof BASE_WS_CLIENT;
	private _apiKey = '';
	private _connectionOptions: WebSocketOptions;
	constructor(clientOptions = BASE_WS_CLIENT) {
		super();
		this.setMaxListeners(Infinity);
		this._clientOptions = clientOptions;

		this._connectionOptions = { ...defaultOptions, ...clientOptions.customOptions };

		this.connect = this.connect.bind(this);
	}
	public async connect(apiKey = '', openCallback = noop) {
		const nav = navigator as any;
		const isBrave = (nav?.brave && (await nav?.brave?.isBrave())) || false;
		if (this._apiKey) {
			if (this._apiKey !== apiKey && this.isReady === true) {
				this.reset();
				this.connect(apiKey, openCallback);
			}
			return;
		}
		this._apiKey = apiKey;
		LOG4(`attempting ws connect`, `[${this._clientOptions.name}]client WS event`);
		this._socket = new WebSocket(this._clientOptions.base, [], this._connectionOptions);

		this._socket.addEventListener('open', e => {
			LOG('open', `${this._clientOptions.name} WS event open`);
			console.log('subscribing to dummy...');
			openCallback(e);
		});
		this._socket.addEventListener('close', e => {
			LOG4(e?.reason, `${this._clientOptions.name} WS event close`);
			storeDispatch(setIsWsConnected(false));
			this.setSocketAuth = false;
		});
		this._socket.addEventListener('error', e => {
			LOG4(e?.message, `${this._clientOptions.name} WS event error`);
			if (isBrave && (e?.message === 'timeout' || e?.message === 'TIMEOUT')) {
				alert('There are known issues on Brave browser. Please use Chrome or Firefox');
			}
		});
		this._socket.addEventListener('message', msg => {
			this.processMsg(msg);
		});
	}
	private reset() {
		this.closeSocket(1000, 'new api key');
		this._apiKey = '';
	}
	get isReady() {
		if (this._socket && this._socket?.readyState === 1) return true;
		return false;
	}

	set setSocketAuth(bool: boolean) {
		this._socketAuthenticated = bool;
	}

	public socketSend(
		type: string,
		body: Record<string, any>,
		cb?: (...args: any[]) => void,
		options?: { once?: boolean; type?: string }
	) {
		const sendType = WS.MESSAGES[type]?.type;
		const sendBody = bodyParamsValidation(type, body, WS.MESSAGES) as any;

		//  save for later reference
		if (body?.localSave) {
			storeDispatch(
				setInstantOrder({ order: body as OrderTemplate, extOrderId: (sendBody as ProcessedOrder).ext_order_id })
			);
		}

		LOG(sendBody, `WS SEND - ${sendType}`);
		(this._socket as WebSocket).send(
			JSON.stringify({
				type: sendType,
				...sendBody,
			})
		);
		if (isFunction(cb)) {
			const checkType = options?.type ? options.type : WS.MESSAGES[type].type;
			const callback = (data: any) => {
				cb(data);
			};
			if (options?.once === false) {
				this._localEmitter.addListener(checkType, callback);
				return () => this._localEmitter.removeListener(checkType, callback);
			} else {
				this._localEmitter.once(checkType, callback);
			}
		}
	}

	private processMsg(msg: any) {
		const objMsg = toPlainObject(msg);
		// LOG(objMsg, 'ws process msg');
		try {
			const data = JSON.parse(String(objMsg?.data));
			// LOG2(data, 'ws process msg');
			// const refinedData = wsDataRefiner(data?.type, data);
			let refinedData;
			// TODO : remove try catch when backend is ready
			try {
				refinedData = wsDataRefiner(data?.type, data);
			} catch (ex) {
				LOG2((ex as any)?.message, 'ws threw while refining');
				refinedData = data;
			}
			// LOG2(refinedData, 'ws process msg');
			this._localEmitter.emit(data?.type, refinedData?.data);
			this.emit('message', refinedData);
		} catch (ex) {
			console.error(ex);
		}
	}

	get socket() {
		return this._socket;
	}

	public closeSocket(code: number, reason: string) {
		this.socketSend(MESSAGE_TYPES.LOGOUT, {}, null);
		(this.socket as WebSocket).close(code, reason);
		each(this._localEmitter.eventNames(), evName => this._localEmitter.removeAllListeners(evName));
	}

	public reconnectSocket(code, reason) {
		this.socket.reconnect(code, reason);
	}

	public listen(checkType: string, callback: (value: any) => void): () => void {
		this._localEmitter.addListener(checkType, callback);
		return () => this._localEmitter.removeListener(checkType, callback);
	}

	public listenOnce(checkType, callback) {
		this._localEmitter.once(checkType, callback);
		return () => this._localEmitter.removeListener(checkType, callback);
	}

	public sendOrder(body) {
		this.socketSend(MESSAGE_TYPES.ORDER, body);
	}

	private subscribeToChannel(channel: string, symbols: string[]) {
		this.socketSend(MESSAGE_TYPES.SUBSCRIBE, { channels: [channel], symbols });
	}

	private unsubscribeFromChannel(channel: string, symbols: string[], cb?: () => void) {
		this.socketSend(MESSAGE_TYPES.UNSUBSCRIBE, { channels: [channel], symbols }, cb);
	}

	public requestChannelSubscribe(channel, symbols) {
		if (this._channelMap.has(channel)) {
			//  channel's symbols is not nil or []
			if (!isNil(this._channelMap.get(channel)) && !empty(this._channelMap.get(channel))) {
				// CASE
				//  requested subscribe had extra symbøls & some other component
				//  is already subscribed to a different array of symbols
				const diff = difference(symbols, this._channelMap.get(channel));
				if (!empty(diff)) {
					//  replace symbol array with appended array consisting of unique values
					this._channelMap.set(channel, [...this._channelMap.get(channel), ...diff]);
					LOG3(diff, `Extra symbols for channel ${channel}`);
					return;
				}
			}
		}
		LOG3(`channel added - ${channel}`, 'channel sub');
		this._channelMap.set(channel, symbols);
		this.subscribeToChannel(channel, symbols);
	}

	public reinitChannelSubscribe(channel: string, symbols: string[]) {
		LOG3(`reinit - ${channel} - ${symbols}`, 'channel sub');
		this.subscribeToChannel(channel, symbols);
	}

	public requestChannelUnsubscribe(channel: string, symbols: string[]) {
		LOG2(channel, 'ws request channel unsub');
		this._channelMap.delete(channel);
		this.unsubscribeFromChannel(channel, symbols);
	}

	public requestSymbolSubscribe(channel: string, symbols: string[]) {
		if (symbols?.length < 1) return;
		let diff = difference(symbols, this._channelMap.get(channel));
		if (!empty(diff)) {
			this.subscribeToChannel(channel, diff);
		}
	}

	public requestSymbolUnsubscribe(channel: string, symbols: string[]) {
		if (!isString(channel)) {
			LOG5(channel, 'unsub non-string channel');
			return;
		}
		if (symbols?.length < 1) return;
		let diff = difference(this._channelMap.get(channel), symbols);
		if (!empty(diff)) {
			console.log('unsubsymbol request', channel, symbols);
			this.unsubscribeFromChannel(channel, symbols);
		}
	}

	public authorizeClient(token, cb) {
		this.socketSend(MESSAGE_TYPES.AUTHENTICATE, { token }, data => {
			cb(data);
			if (data?.message === 'success') {
				this.setSocketAuth = true;
			}
		});
	}

	public addEventListener(cb) {
		this.addListener('message', cb);
		return () => this.removeEventListener(cb);
	}

	public removeEventListener(cb) {
		this.removeListener('message', cb);
	}
}

const baseSocketClient = new SocketClient(BASE_WS_CLIENT);

export { SocketClient, baseSocketClient };
