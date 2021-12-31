import empty from 'is-empty';
import every from 'lodash-es/every';

import { ClientState } from 'classes/ClientState';
import { baseSocketClient } from 'classes/SocketClient';
import { CHANNELS, CHANNEL_OPTIONS } from 'consts';
import { batchProcessOrder, setOrderbook } from 'contexts/custom/orderbook';
import { getHiddenVisChange, getIsDocumentHidden } from 'utils/scripts';

export class OrderbookClient {
	static instance = this;
	static updateInterval = 200;
	static idleTimeout = 5000;
	static noFocusPauseTimeout = 5000;
	//	channel name + update message type
	static channel = CHANNELS.ORDERBOOK_LEVEL2;

	//	init message type
	static messageType = CHANNEL_OPTIONS.ORDERBOOK_LEVEL2.customType;

	private _processingReinit: boolean = false;
	private _currentSymbol: string;

	//	flush and stop all updates when _isIdle is switched to true.
	//	Refetch entire orderbook on refocus if _isIdle is true on refocus of window
	private _clientState: ClientState;
	private _baseSocketUnListen: () => void;

	private _updateArray: any[];

	//	if the number is smaller in next socket message -> request a new snapshot since data is corrupted
	private _seqNumber = 0;
	private _lastUpdateSeqNumber = 0;

	get updateArray(): any[] {
		return this._updateArray;
	}

	get shouldUpdate(): boolean {
		return !this._clientState.isIdle && this._clientState.isReady && !getIsDocumentHidden();
	}

	get isWsConnected(): boolean {
		return this._clientState.isReady;
	}

	public constructor(isWsReady: boolean, currentSymbol: string) {
		this._updateArray = [];
		this._currentSymbol = currentSymbol;
		this._clientState = new ClientState(isWsReady, OrderbookClient.updateInterval, OrderbookClient.idleTimeout);

		this._clientState.bindIdleChangeEvent((isIdle: boolean) => {
			//	when isIdle changes to false, re-request orderbook snapshot
			if (isIdle) return;
			baseSocketClient.reinitChannelSubscribe(OrderbookClient.channel, [this._currentSymbol]);
			this._processingReinit = true;
		});
		if (!this._clientState.isReady) return;
		this.subUnsubChannels(true);

		this._baseSocketUnListen = baseSocketClient.addEventListener(msg => this.socketCallback(msg));

		//	redo sockets on refocus
		const [hidden, visibilityChange] = getHiddenVisChange();
		const handleVisChange = () => {
			if (document[hidden]) {
				this.subUnsubChannels(false);
			} else {
				this.subUnsubChannels(true);
			}
		};
		document.addEventListener(visibilityChange, handleVisChange, false);
	}

	public onSocketDisconnect() {
		this._updateArray = [];
		this.setIsReady(false);
		this._baseSocketUnListen();
	}

	public onSocketConnect() {
		this.setIsReady(true);
		this._baseSocketUnListen = baseSocketClient.addEventListener(msg => this.socketCallback(msg));
	}

	public socketCallback(msg: any): void {
		if (msg.type !== OrderbookClient.messageType) return;

		if (msg.data.updateType === 'snapshot') {
			//	always flush update array on new snapshot
			this._updateArray.length = 0;
			this._processingReinit = false;
			setOrderbook(msg.data);
			this._lastUpdateSeqNumber = msg.data.seqNumber;
			this._seqNumber = msg.data.seqNumber;
			this.updateLoop();
		} else {
			//	ignore updates if waiting for reinit or state is idle
			if (this._processingReinit || this._clientState.isIdle) return;
			this._updateArray.push(msg.data);
			//	request new snapshot because something went wrong
			if (msg.data.seqNumber !== this._seqNumber + 1) {
				console.log('sequence mismatch... ' + msg.data.seqNumber + ' <= ' + this._seqNumber);
				baseSocketClient.requestChannelSubscribe(OrderbookClient.channel, [this._currentSymbol]);
				this._processingReinit = true;
			} else {
				this._seqNumber++;
			}
		}

		//	update sequenceNum
		this._seqNumber = msg.data.seqNumber;
	}

	private updateLoop() {
		const interval = setInterval(() => {
			if (!empty(this.updateArray) && !this._processingReinit) {
				if (this.verifyUpdateArray(this.updateArray, this._lastUpdateSeqNumber, this._seqNumber)) {
					this._lastUpdateSeqNumber = this.updateArray[this.updateArray.length - 1]?.seqNumber;
					batchProcessOrder([...this.updateArray], this._currentSymbol);

					this._updateArray.length = 0;
				} else {
					//	don't update if update array has issues
					console.log(
						'sequence verification failed ' + this._seqNumber,
						[...this.updateArray],
						this._lastUpdateSeqNumber,
						this._seqNumber
					);
					baseSocketClient.requestChannelSubscribe(OrderbookClient.channel, [this._currentSymbol]);
					this._processingReinit = true;
				}
			}
			if (!this.shouldUpdate) {
				clearInterval(interval);
			}
		}, OrderbookClient.updateInterval);
	}

	//	verifies seqNumber increases constantly by 1 and last value is the same as the one tracked by the OrderbookClient
	private verifyUpdateArray(updateArray, lastUpdateNumber, lastSeqNumber) {
		let prev;
		const isIncreasingSeqNumber = every(updateArray, update => {
			if (!prev) prev = update.seqNumber;
			else {
				if (prev + 1 !== update.seqNumber) return false;
				else prev++;
			}
			return true;
		});
		if (isIncreasingSeqNumber) {
			return (
				updateArray[0]?.seqNumber === lastUpdateNumber + 1 &&
				updateArray[updateArray.length - 1]?.seqNumber === lastSeqNumber
			);
		} else {
			return false;
		}
	}

	private subUnsubChannels(subscribe: boolean): void {
		console.log('channelSUB', this._currentSymbol);
		if (subscribe) {
			baseSocketClient.requestChannelSubscribe(OrderbookClient.channel, [this._currentSymbol]);
		} else {
			baseSocketClient.requestChannelUnsubscribe(OrderbookClient.channel, [this._currentSymbol]);
		}
	}

	get currentSymbol(): string {
		return this._currentSymbol;
	}

	public setIsReady(isReady: boolean): void {
		this._clientState.isReady = isReady;
		this.subUnsubChannels(this._clientState.isReady);
	}

	//	updates current symbol and symbol subscription
	public symbolChange(currentSymbol: string): void {
		this.subUnsubChannels(false);
		this._currentSymbol = currentSymbol;
		this._baseSocketUnListen();
		this._updateArray.length = 0;

		this.subUnsubChannels(true);
		this._baseSocketUnListen = baseSocketClient.addEventListener(msg => this.socketCallback(msg));
	}

	//	should only run when this object itself is being destroyed
	public cleanup(): void {
		this._clientState.cleanup();
		this._baseSocketUnListen();
	}
}
