import { EventEmitter } from 'events';

import { getIsDocumentHidden, listenToWindowVisibilityChange } from 'utils/scripts';

/*
 * Tracks the idle state and readiness of an abstract client.
 * tracks whether the window has not been focused in more than _idleTimeout milliseconds
 */

export class ClientState extends EventEmitter {
	static idleChangeEvent = 'idleChange';
	private _isReady: boolean;

	private _isIdle: boolean = false;
	private _idleTimeoutId?: NodeJS.Timeout;
	private readonly _windowVisibility: { isVisible: boolean; timestamp: number };
	private readonly _unbindVisibilityListener: () => void;
	private _unbindVisChangeListener?: () => void;

	public constructor(isReady: boolean, updateInterval: number = 200, idleTimeout: number = 5000) {
		super();
		this._isReady = isReady;
		this._windowVisibility = { isVisible: !getIsDocumentHidden(), timestamp: Date.now() };
		this._unbindVisibilityListener = listenToWindowVisibilityChange((isVisible: boolean) => {
			this._windowVisibility.isVisible = isVisible;
			if (!this._windowVisibility.isVisible) {
				this._windowVisibility.timestamp = Date.now();
				this._idleTimeoutId = setTimeout(() => {
					if (!this._isIdle) {
						this.emit(ClientState.idleChangeEvent, true);
						this._isIdle = true;
					}
				}, idleTimeout);
			} else {
				clearTimeout(this._idleTimeoutId);
				if (this._isIdle) {
					this._isIdle = false;
					this.emit(ClientState.idleChangeEvent, false);
				}
			}
		});
		this.setMaxListeners(Number.MAX_SAFE_INTEGER);
	}

	public cleanup(): void {
		this._unbindVisibilityListener();
		if (this._unbindVisChangeListener) this._unbindVisChangeListener();
	}

	set isReady(isReady: boolean) {
		this._isReady = isReady;
	}
	get isReady(): boolean {
		return this._isReady;
	}
	get isVisible(): boolean {
		return this._windowVisibility.isVisible;
	}
	get isIdle(): boolean {
		return this._isIdle;
	}

	public bindIdleChangeEvent(handler: (bool: boolean) => void): void {
		this.on(ClientState.idleChangeEvent, handler);
		this._unbindVisChangeListener = () => {
			this.off(ClientState.idleChangeEvent, handler);
		};
	}
}
