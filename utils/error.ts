import { AxiosError } from 'axios';

class CustomError extends Error {
	protected msg: string;
	protected date: Date;
	protected data: any;
	protected status: number;
	protected statusText: string;
	constructor(msg, ex?: AxiosError | Error, ...params) {
		// Pass remaining arguments (including vendor specific ones) to parent constructor
		super(...params);

		// Maintains proper stack trace for where our error was thrown (only available on V8)
		if (Error?.captureStackTrace) {
			Error.captureStackTrace(this, CustomError);
		}

		this.name = 'CustomError';
		// Custom debugging information
		this.msg = msg;
		this.date = new Date();

		if (ex) {
			if (CustomError.isAxiosError(ex)) {
				const axiosEx = ex as AxiosError;
				this.data = axiosEx.response?.data;
				this.status = axiosEx.response?.status;
				this.statusText = axiosEx.response?.statusText;
			}
			//	has a message
			if (ex?.message) {
				this.message = ex?.message;
			}
		}
	}
	static isAxiosError(ex: unknown): boolean {
		return (ex as AxiosError).response !== undefined;
	}
}

export { CustomError };
