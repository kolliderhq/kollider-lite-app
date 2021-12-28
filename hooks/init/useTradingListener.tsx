import React from 'react';

import includes from 'lodash-es/includes';

import { baseSocketClient } from 'classes/SocketClient';
import { CHANNELS, DIALOGS, MESSAGE_TYPES, TABS, TRADING_TYPES } from 'consts';
import {
	mergeInstantOrder,
	reduxStore,
	setInvoiceSettled,
	setNewInvoice,
	setOrderId,
	setUserWithdrawlLimits,
	storeDispatch,
} from 'contexts';
import { setDialog, setTab } from 'contexts/modules/layout';
import { useAppSelector } from 'hooks/redux';
import { LOG5 } from 'utils/debug';
import { formatNumber } from 'utils/format';
import { OrderInvoice, ReceivedOrder } from 'utils/refiners/sockets';

export const useTradingListener = () => {
	const wsReady = useAppSelector(state => state.connection.isWsConnected);

	React.useEffect(() => {
		if (!wsReady) return;
		baseSocketClient.addEventListener(tradingListener);
		return () => {
			baseSocketClient.removeEventListener(tradingListener);
		};
	}, [wsReady, tradingListener]);
};

const tradingListener = (msg: any) => {
	if (!includes(TRADING_TYPES, msg?.type)) return;
	if (msg.type === TRADING_TYPES.FILL) {
		const data = msg.data;
		const orderId = data.orderId;
		console.log('fill', msg.data);
		storeDispatch(setTab(TABS.POSITIONS));

		// TODO : update logic for fill
		//  update already kept orders and increase the amount of contracts that were filled for them
		// displayToast(
		// 	<OrderFillToast data={msg.data} />,
		// 	'dark',
		// 	null,
		// 	msg.data?.isSelftrade ? (
		// 		<>
		// 			Order <span className="text-theme-main">Self Filled</span>
		// 		</>
		// 	) : (
		// 		<>
		// 			Order <span className="text-theme-main">Filled</span>
		// 		</>
		// 	),
		// 	true
		// );
	} else if (msg.type === TRADING_TYPES.DONE) {
		if (msg.data?.reason === 'Cancel') {
			// TODO : should technically never happen in the lite client - check if this is true
			const id = msg.data?.order_id;
			// const order = findOrderInfo(id);
			// if (!order) {
			// 	LOG5(`cancel order but id not found - ${id}`, 'Cancel Donez');
			// 	return;
			// }
			// TODO : delete orders kept in redux
			// console.log('CANCEL ORDER', order);
			// hide Liquidation orders due to spam
			// if (order.orderType === 'LIQ') return;
			// displayToast(
			// 	<OrderCancelToast data={order} />,
			// 	'dark',
			// 	null,
			// 	<>
			// 		Order <span className="text-red-500">Cancelled</span>
			// 	</>,
			// 	true
			// );
		} else if (msg.data?.reason === 'Fill') {
			const orderId = msg.data?.order_id;
			if (!orderId) return;
			console.log('FILL', msg.data);
			// TODO : delete orders kept in redux
		} else {
			LOG5(`undefined reason - ${msg.data?.reason}`, 'done');
		}
	} else if (msg.type === TRADING_TYPES.RECEIVED) {
		if (!msg.data) return;
		const data = msg.data as ReceivedOrder;
		storeDispatch(mergeInstantOrder(data));
		storeDispatch(setOrderId(data));
		// TODO : update order id store

		const currentInvoice = reduxStore.getState().invoices.invoices[data.symbol];
		console.log(data, currentInvoice);
		if (currentInvoice?.extOrderId === data.extOrderId) {
			storeDispatch(setInvoiceSettled(data.symbol));
		}
	} else if (msg.type === TRADING_TYPES.TRADE) {
		const data = msg.data;
		// TODO : update matches store with new trade
	} else if (msg.type === TRADING_TYPES.ORDER_INVOICE) {
		const data = msg.data; // as OrderInvoice;
		const orderId = data.orderId;
		const symbol = data.symbol;
		const orderIds = reduxStore.getState().trading.orderIds;
		if (orderIds?.[symbol]?.[orderId]) {
			data.extOrderId = orderIds[symbol][orderId]?.extOrderId;
		}
		storeDispatch(setNewInvoice(data));
	} else if (msg.type === TRADING_TYPES.WITHDRAWAL_LIMIT_INFO) {
		storeDispatch(setUserWithdrawlLimits(msg.data));
	} else if (msg.type === TRADING_TYPES.DEPOSIT_REJECTION) {
		// displayToast(
		// 	<>
		// 		Deposit was rejected
		// 		<br />
		// 		{msg.data.reason}
		// 	</>,
		// 	'error',
		// 	null,
		// 	'Trade fail',
		// 	true
		// );
	} else if (msg.type === TRADING_TYPES.SETTLEMENT_REQUEST) {
		// settling happens by withdrawals only
		// console.log('settlementRequest >>>>>>', msg.data);
		// updateInvoiceStore({ settlement: msg.data, viewing: true });
	} else if (msg.type === TRADING_TYPES.WITHDRAWAL_SUCCESS) {
		// TODO : hide invoice modal(user scanned qr code)
		// updateInvoiceStore({ settlement: null, viewing: false });
		const store = reduxStore.getState();
		if (store.layout.dialog === DIALOGS.SETTLE_INVOICE) {
			storeDispatch(setDialog(DIALOGS.NONE));
		}
		// displayToast(
		// 	<>
		// 		{'Close Position / Withdraw'}
		// 		<br />
		// 		<DisplayAmount decimals={0} denom={'SATS'} amount={msg.data.amount} sizeInt={14} sizeDenom={12} />
		// 	</>,
		// 	'dark',
		// 	null,
		// 	'Withdraw success',
		// 	true
		// );
		baseSocketClient.socketSend(MESSAGE_TYPES.WITHDRAWAL_LIMIT_INFO, {}, null, null);
	} else if (msg.type === TRADING_TYPES.LIQUIDATIONS) {
		const store = reduxStore.getState();
		const symbolData = store.symbols.symbolData;
		// dont update ohlc store if symbolData is not loaded(graph is not loaded anyway)
		if (!symbolData?.[msg.data?.symbol]?.priceDp) return;
		console.log('LIQUIDATION', msg.data);
		// displayToast(<LiquidationToast data={msg.data} />, 'dark', { autoClose: 7000 }, 'Liquidation', true);
	} else if (msg.type === TRADING_TYPES.WITHDRAWAL_REJECTION) {
		// displayToast(
		// 	<p className="text-sm">{msg.data.reason}</p>,
		// 	'dark',
		// 	{ autoClose: 7000 },
		// 	'Withdrawal Rejection',
		// 	true
		// );
	} else if (msg.type === TRADING_TYPES.DEPOSIT_SUCCESS) {
		let message = <></>;
		if (msg?.data?.deposit?.amount) {
			message = (
				<>
					<br />
					<span className="font-bold">{formatNumber(msg?.data?.deposit?.amount)} SATS</span>
				</>
			);
		}
		// displayToast(<p>Deposit Success{message}</p>, 'dark', { autoClose: 7000 }, 'Deposit', true);
		baseSocketClient.socketSend(MESSAGE_TYPES.WITHDRAWAL_LIMIT_INFO, {}, null, null);
	} else if (msg.type === TRADING_TYPES.RAW_DEPOSIT) {
		const paymentRequest = msg?.data?.payment_request;
		if (!paymentRequest) return;
		// TODO : update invoice store and display
	} else if (msg.type === TRADING_TYPES.LNURL_WITHDRAWAL_REQUEST) {
		//  do nothing - it's processed elsehwere
		//  components/pages/dashboard/semi-modal/WithdrawView.js -> from kollider pro atm
	} else if (msg.type === TRADING_TYPES.RAW_WITHDRAWAL) {
		const paymentRequest = msg?.data?.paymentRequest;
		if (!paymentRequest) return;
		// TODO : process payment request to display qr code
		// updateInvoiceStore({ withdrawSettled: paymentRequest });
		// not used atm.
		// updateInvoiceStore({ withdrawSettled: msg.data.paymentRequest });
		// displayToast(
		// 	<p className="text-sm">
		// 		Successfully Withdrew
		// 		<br />
		// 		<span className="font-bold">
		// 			{formatNumber(msg.data.amount)}
		// 			<span className="text-xs">SATS</span>
		// 		</span>
		// 	</p>,
		// 	'dark',
		// 	{ autoClose: 6000 },
		// 	'Withdraw'
		// );
	} else if (msg.type === TRADING_TYPES.ADL_NOTICE) {
		// displayToast(<ADLToast data={msg.data} />, 'error', { position: 'top-right' }, 'Auto Deleverage Notice', true);
	} else {
		console.warn('unprocessed msg type', msg?.type);
		console.log(msg);
		// if (!includes(TRADING_KEYS, msg?.type)) return;
		// updateTradingStore({ [msg.type]: msg.data });
	}
};
