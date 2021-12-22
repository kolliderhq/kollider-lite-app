import { Queue } from 'classes/Queue';
import { LOG4 } from 'utils/debug';
import { CustomError } from 'utils/error';

export interface Process {
	processFunc: () => any;
	processCallback?: (...args: any[]) => void;
}

enum STATE {
	IDLE,
	BUSY,
}

/**
 * Linearly processes functions that are pushed into a queue
 * in the order that the functions were pushed.
 * Prevents async issues that pop up frequently in react hooks world
 */
export class Processor {
	private _state: STATE;
	private _queue: Queue<Process>;
	private _shouldKill = false;

	public constructor() {
		this._state = STATE.IDLE;
		this._queue = new Queue<Process>();
	}

	get empty() {
		return this._queue.length === 0;
	}

	/**
	 * Requests the processor to add a process to the queue.
	 * @param process{Process}
	 */
	public requestProcess(process: Process): void {
		if (this._state === STATE.IDLE && this.empty) this.executeProcess(process);
		else this._queue.push(process);
	}

	/**
	 * Executes processes and the callbacks with the return values of the process.
	 * Automatically starts the next process lined up in the queue after processing.
	 * can kill using the 'forceStop' method.
	 */
	private async executeProcess(process: Process): Promise<void> {
		if (this._shouldKill) {
			this._state = STATE.IDLE;
			const flushed = this._queue.flush();
			this._shouldKill = false;
			LOG4(`Force killed Process ${flushed + 1}`, 'Processor');
			return;
		}
		if (this._state !== STATE.BUSY) this._state = STATE.BUSY;
		await new Promise((resolve, reject) => {
			Promise.resolve(process.processFunc())
				.then(result => {
					if (process.processCallback) process.processCallback(result);
					resolve(undefined);
				})
				.catch(ex => {
					//	error handling that should only happen while developing
					console.error('error while processing process', ex);
					console.log(process);
					this.forceStop();
					return;
				});
		});

		if (!this.empty) this.executeProcess(this._queue.pop());
		else this._state = STATE.IDLE;
	}

	public forceStop() {
		this._shouldKill = true;
	}
}
