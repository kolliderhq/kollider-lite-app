import { EventEmitter } from 'events';

import each from 'lodash-es/each';
import { v4 as uuidv4 } from 'uuid';

export const getOrderbookInitSymbolState = () => ({
	asks: [],
	bids: [],
	asksTotal: null,
	bidsTotal: null,
	mid: null,
	prevMid: null,
});

export class Orderbook {
	public static instance;
	private _orderbook: Record<string, ReturnType<typeof getOrderbookInitSymbolState>>;
	private _flashObj: Record<string, Record<number, number>>;
	private _id: string;

	public eventEmitter: EventEmitter;
	public proxyOrderbook;

	public constructor() {
		Orderbook.instance = this;
		this._id = uuidv4();
		this._orderbook = {
			'BTCUSD.PERP': getOrderbookInitSymbolState(),
		};
		this._flashObj = {
			'BTCUSD.PERP': {},
		};
		this.initEmitter();

		this.makeChildHandler = this.makeChildHandler.bind(this);
		this.handler = this.handler.bind(this);

		this.proxyOrderbook = new Proxy(this._orderbook, this.handler());
	}

	public updateOrderbookSymbols(symbolArr: string[]) {
		each(symbolArr, symbol => {
			if (!orderbook.rawOrderbook?.[symbol]) {
				this.updateRawOrderbook(symbol, getOrderbookInitSymbolState());
			}
			if (!this.flashObj?.[symbol]) this.updateFlashObj(symbol, {});
		});
	}

	private initEmitter() {
		this.eventEmitter = new EventEmitter();
		this.eventEmitter.setMaxListeners(Number.MAX_SAFE_INTEGER);
	}

	//	for updates
	get rawOrderbook() {
		return this._orderbook;
	}

	get id() {
		return this._id;
	}

	get flashObj() {
		return this._flashObj;
	}

	public updateRawOrderbook(symbol: string, value: any) {
		this._orderbook[symbol] = value;
	}

	public updateFlashObj(symbol: string, value: any) {
		this._flashObj[symbol] = value;
	}

	//	rushed into a class so not optimal
	private makeChildHandler(emitKey) {
		return {
			set: function (obj, prop, value) {
				obj[prop] = value;
				Orderbook.instance.eventEmitter.emit(emitKey);
				return true;
			},
			get: function (obj, prop) {
				if (prop === 'isProxy') return true;
				// @ts-ignore
				return Reflect.get(...arguments);
			},
		};
	}

	// handler for orderbook proxy - rushed into a class so not optimal
	private handler = () => {
		return {
			set: function (obj, prop, value) {
				obj[prop] = value;
				Orderbook.instance.eventEmitter.emit(prop); // emits the symbol. Only used when the entire array is set
				return true;
			},
			get(obj, prop) {
				if (prop === 'isProxy') return true;

				// return value if '_' is at front
				if (prop.startsWith('_')) {
					const realProp = prop.substring(1);
					if (typeof obj[realProp] !== 'object') return;
					return obj[realProp];
				}

				const value = obj[prop];
				if (typeof value === 'undefined') return;

				// set the value as a proxy if it isn't
				if (!value.isProxy && typeof value === 'object') {
					const childHandler = Orderbook.instance.makeChildHandler(prop);
					obj[prop] = new Proxy(value, childHandler);
				}
				// always returns a proxy
				return obj[prop];
			},
		};
	};

	public setOrderbookSnapshot(data, symbol: string) {
		this.proxyOrderbook[symbol] = data;
	}
}

const orderbook = new Orderbook();
export { orderbook };
