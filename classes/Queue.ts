import { LOG4 } from 'utils/debug';

export class Queue<T> {
	private _queue: T[] = [];

	public constructor() {}

	public push(value: T) {
		this._queue.push(value);
	}

	public pop() {
		if (this._queue.length === 0) {
			LOG4('attempted to pop an empty queue', 'Queue');
			return undefined;
		}
		return this._queue.shift();
	}

	get length() {
		return this._queue.length;
	}

	/**
	 * @desc flushes the queue entirely
	 */
	public flush(): number {
		const length = this._queue.length;
		this._queue.length = 0;
		return length;
	}
}
