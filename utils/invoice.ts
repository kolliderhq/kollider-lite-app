import { LOG } from 'utils/debug';

const invoiceParser = require('@node-lightning/invoice');

export const validateInvoiceAmount = (invoiceStr, amount) => {
	let invoice;
	try {
		invoice = invoiceParser.decode(invoiceStr);
	} catch (ex) {
		return false;
	}
	LOG(`${invoice.valueSat} - ${amount}`, 'Invoice - amount');
	return Number(invoice.valueSat) === Number(amount);
};

export const getInvoiceData = invoiceStr => {
	let invoice;
	try {
		invoice = invoiceParser.decode(invoiceStr);
	} catch (ex) {
		console.error(ex);
		return {};
	}
	return invoice;
};
