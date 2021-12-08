import chalk from 'chalk';
import isObject from 'lodash-es/isObject';

const ctx = new chalk.Instance({ level: 1 });

const log = (level, message, title) => {
	if (level < process.env.NEXT_PUBLIC_DEBUG_MODE) return;
	if (isObject(message)) {
		log(level, `==${title ? title : `[LVL - ${level}]`}==`);
		console.log(message);
		return;
	}
	switch (level) {
		case 1:
			console.log(ctx.gray(`${title ? `[${title}] ` : ''}${message}`));
			break;
		case 2:
			console.log(ctx.yellow(`${title ? `[${title}] ` : ''}${message}`));
			break;
		case 3:
			console.log(ctx.green(`${title ? `[${title}] ` : ''}${message}`));
			break;
		case 4:
			console.log(ctx.magenta(`${title ? `[${title}] ` : ''}${message}`));
			break;
		default:
			console.log(ctx.red(ctx.yellow.underline.bold(`${title ? `[${title}] ` : ''}${message}`)));
	}
};
const debug = { log };

export const LOG = (message, title) => log(1, message, title);
export const LOG2 = (message, title) => log(2, message, title);
export const LOG3 = (message, title) => log(3, message, title);
export const LOG4 = (message, title) => log(4, message, title);
export const LOG5 = (message, title) => log(5, message, title);

export default debug;
