import { EventEmitter2 as EventEmitter } from 'eventemitter2';
import isFunction from 'lodash-es/isFunction';
import noop from 'lodash-es/noop';
import toPlainObject from 'lodash-es/toPlainObject';
import WebSocket, { Options as WebSocketOptions } from 'reconnecting-websocket';

import { socketDefaultOptions } from 'classes/SocketClient';
import { WS_UMBREL } from 'consts';
import { LOG, LOG2, LOG3, LOG4 } from 'utils/debug';

class UmbrelSocketClient extends EventEmitter {
	private _socket: WebSocket | undefined;

	constructor() {
		super();
		this.connect = this.connect.bind(this);
	}

	public async connect(openCallback = noop, closeCallback = noop) {
		this._socket = new WebSocket(WS_UMBREL.BASE, [], socketDefaultOptions);
		this._socket.addEventListener('open', e => {
			LOG('open', `Umbrel WS event open`);
			console.log('subscribing to dummy...');
			openCallback();
		});
		this._socket.addEventListener('close', e => {
			LOG4(e?.reason, `Umbrel WS event close`);
			closeCallback();
		});
		this._socket.addEventListener('error', e => {
			LOG4(e?.message, `Umbrel WS event error`);
		});
		this._socket.addEventListener('message', msg => {
			this.processMsg(msg);
		});
	}

	public socketSend(
		type: string,
		body: Record<string, any> = {},
		cb?: (...args: any[]) => void,
		options: { once: boolean; type?: string } = { once: true }
	) {
		const sendType = WS_UMBREL.MESSAGES[type]?.type;
		(this._socket as WebSocket).send(
			JSON.stringify({
				type: sendType,
				...body,
			})
		);
		LOG3({ type: sendType, ...body }, 'Umbrel Socket Send');
		if (isFunction(cb)) {
			const checkType = options?.type ? options.type : WS_UMBREL.MESSAGES[type].returnType;
			const callback = (data: any) => {
				cb(data);
			};
			if (options?.once === false) {
				this.addListener(checkType, callback);
				return () => this.removeListener(checkType, callback);
			} else {
				this.once(checkType, callback);
			}
		}
	}

	private processMsg(msg: any) {
		const objMsg = toPlainObject(msg);
		try {
			const data = JSON.parse(String(objMsg?.data));
			let refinedData;
			try {
				refinedData = dataRefiner(data?.type, data);
			} catch (ex) {
				LOG2((ex as any)?.message, 'ws threw while refining');
				refinedData = data;
			}
			this.emit(data?.type, refinedData);
		} catch (ex) {
			console.error(ex);
		}
	}

	public addAnyEventListener(cb: (...args: any[]) => void) {
		this.onAny(cb);
	}

	public removeAnyEventListener(cb: (...args: any[]) => void) {
		this.offAny(cb);
	}

	public addEventListener(eventName: string, cb: () => void) {
		this.addListener(eventName, cb);
		return () => this.removeEventListener(eventName, cb);
	}

	public removeEventListener(eventName: string, cb: () => void) {
		this.removeListener(eventName, cb);
	}
}

const dataRefiner = (type: string, data: any) => {
	switch (type) {
		case WS_UMBREL.MESSAGES.CREATE_INVOICE.returnType:
			return data;
		case WS_UMBREL.MESSAGES.SEND_PAYMENT.returnType:
			return data;
		case WS_UMBREL.MESSAGES.GET_NODE_INFO.returnType:
			return data;
		case WS_UMBREL.MESSAGES.GET_WALLET_BALANCE.returnType:
			return data;
		case WS_UMBREL.MESSAGES.AUTH_LNURL.returnType:
			return data;
		case WS_UMBREL.MESSAGES.AUTHENTICATION.returnType:
			return data;
		case 'error':
			console.log(data);
			return data;
		default: {
			console.error('unknown type', type);
			console.log(data);
			return data;
		}
	}
};

const baseUmbrelSocketClient = new UmbrelSocketClient();

export { baseUmbrelSocketClient };
