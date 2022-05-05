import React from 'react';

import includes from 'lodash-es/includes';

import { baseSocketClient } from 'classes/SocketClient';
import { DIALOGS, MESSAGE_TYPES, TRADING_TYPES } from 'consts';
import {
	mergeInstantOrder,
	reduxStore,
	removeOrderId,
	setInvoiceSettled,
	setNewInvoice,
	setOrderId,
	setUserWithdrawlLimits,
	setAdvancedOrder,
	deleteAdvancedOrder,
	storeDispatch,
	setNumberWithdrawalsRejected,
} from 'contexts';
import { setDialog, setPopupClose } from 'contexts/modules/layout';
import { useAppSelector } from 'hooks/redux';
import { LOG5 } from 'utils/debug';
import { applyDp, formatNumber } from 'utils/format';
import { ReceivedOrder } from 'utils/refiners/sockets';
import { TOAST_LEVEL, displayToast } from 'utils/toast';

export const useTradingListener = () => {
	const wsReady = useAppSelector(state => state.connection.isWsConnected);

	React.useEffect(() => {
		if (!wsReady) return;
		baseSocketClient.addEventListener(tradingListener);
		return () => {
			baseSocketClient.removeEventListener(tradingListener);
		};
	}, [wsReady]);
};

const tradingListener = (msg: any) => {
	if (!includes(TRADING_TYPES, msg?.type)) return;
	if (msg.type === TRADING_TYPES.FILL) {
		const data = msg.data;
		const orderId = data.orderId;
		console.log('fill', data);
		const priceDp = reduxStore.getState().symbols.symbolData[data.symbol]?.priceDp;
		if (!data || !priceDp) return;

		//	Self fill will never happen since limit orders are not alloweed
		displayToast(
			<p>
				Order Filled - ${formatNumber(applyDp(data.price, priceDp))}
				<br />
				{data.side === 'Bid' ? <span className="text-green-400">Buy</span> : <span className="text-red-400">Sell</span>}
				{' ' + formatNumber(msg.data.quantity)} {data.symbol.split('.')[0]}
			</p>,
			{
				type: 'dark',
				level: TOAST_LEVEL.INFO,
				toastOptions: {
					position: 'bottom-center',
				},
			}
		);

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
			// 	LOG5(`cancel order but id not found - ${id}`, 'Cancel Done');
			// 	return;
			// }
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
			storeDispatch(removeOrderId(orderId));
		} else {
			LOG5(`undefined reason - ${msg.data?.reason}`, 'done');
		}
	} else if (msg.type === TRADING_TYPES.RECEIVED) {
		if (!msg.data) return;
		const data = msg.data as ReceivedOrder;
		storeDispatch(mergeInstantOrder(data));
		storeDispatch(setOrderId(data));

		const currentInvoice = reduxStore.getState().invoices.invoices[data.symbol];
		console.log(data, currentInvoice);
		if (currentInvoice?.extOrderId === data.extOrderId) {
			storeDispatch(setInvoiceSettled(data.symbol));
			storeDispatch(setPopupClose());
		}
	} else if (msg.type === TRADING_TYPES.TRADE) {
		const data = msg.data;
		// update matches store with new trade -> not in Light client
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
		displayToast(
			<p>
				Deposit was rejected
				<br />
				{msg.data.reason}
			</p>,
			{
				type: 'error',
				level: TOAST_LEVEL.CRITICAL,
			}
		);
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
		displayToast(
			<p>
				Withdraw Success
				<br />
				{formatNumber(msg.data.amount)}
				<span className="pl-1 text-xs">SATS</span>
			</p>,
			{
				type: 'dark',
				level: TOAST_LEVEL.CRITICAL,
				toastOptions: {
					position: 'bottom-center',
				},
			}
		);
		baseSocketClient.socketSend(MESSAGE_TYPES.WITHDRAWAL_LIMIT_INFO, {}, null, null);
	} else if (msg.type === TRADING_TYPES.LIQUIDATIONS) {
		const store = reduxStore.getState();
		const symbolData = store.symbols.symbolData;
		// dont update ohlc store if symbolData is not loaded(graph is not loaded anyway)
		if (!symbolData?.[msg.data?.symbol]?.priceDp) return;
		console.log('LIQUIDATION', msg.data);
		// displayToast(<LiquidationToast data={msg.data} />, 'dark', { autoClose: 7000 }, 'Liquidation', true);
	} else if (msg.type === TRADING_TYPES.WITHDRAWAL_REJECTION) {

		const store = reduxStore.getState();
		let numberWithdrawalsRejected = store.invoices.numberWithdrawalsRejected;
		numberWithdrawalsRejected += 1;
		storeDispatch(setNumberWithdrawalsRejected(numberWithdrawalsRejected));

		displayToast(<p className="text-sm">Withdrawal Rejection</p>, {
			type: 'dark',
			level: TOAST_LEVEL.CRITICAL,
			toastId: 'withdrawal-rejection',
			toastOptions: {
				position: 'bottom-center',
			},
		});
	} else if (msg.type === TRADING_TYPES.DEPOSIT_SUCCESS) {
		if (msg?.data?.deposit?.amount) {
			displayToast(
				<p>
					Deposit Success
					<br />
					<span className="font-bold">{formatNumber(msg?.data?.deposit?.amount)}</span>
					<span className="pl-1 text-xs">SATS</span>
				</p>,
				{
					type: 'dark',
					level: TOAST_LEVEL.IMPORTANT,
					toastOptions: {
						position: 'bottom-center',
					},
				}
			);
		}
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
	} else if (msg.type === TRADING_TYPES.ADL_NOTICE) {
		// displayToast(<ADLToast data={msg.data} />, 'error', { position: 'top-right' }, 'Auto Deleverage Notice', true);
	} else if (msg.type === TRADING_TYPES.ORDER_REJECTION) {
		//	do nothing, toast is displayed at refiner
	} else if (msg.type === TRADING_TYPES.ADVANCED_ORDER_OPEN) {
		let data = msg.data.order;
		storeDispatch(setAdvancedOrder({data}));
		const priceDp = reduxStore.getState().symbols.symbolData[data.symbol]?.priceDp;
		if (!data || !priceDp) return;
		displayToast(
			<p>
				{data.advancedOrderType} created @ ${formatNumber(applyDp(data.price, priceDp))}
			</p>,
			{
				type: 'dark',
				level: TOAST_LEVEL.INFO,
				toastOptions: {
					position: 'bottom-center',
				},
			}
		);
	} else if (msg.type === TRADING_TYPES.ADVANCED_ORDER_DONE) {
		let orderId = msg.data.order_id
		storeDispatch(deleteAdvancedOrder({orderId: orderId}));
		displayToast(
			<p>
				TPSL ID: {orderId} Cancelled.
			</p>,
			{
				type: 'dark',
				level: TOAST_LEVEL.INFO,
				toastOptions: {
					position: 'bottom-center',
				},
			}
		);
	} else if (msg.type === TRADING_TYPES.USER_ADVANCED_ORDERS) {
		Object.entries(msg.data.orders).map((k, i) => {
			let order = k[1]
			storeDispatch(setAdvancedOrder({data: order}));
		})
	} else {
		console.warn('unprocessed msg type', msg?.type);
		// if (!includes(TRADING_KEYS, msg?.type)) return;
		// updateTradingStore({ [msg.type]: msg.data });
	}
};
