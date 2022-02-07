import * as React from 'react';
import { ReactElement } from 'react';

// import Symbol from 'components/common/Symbol';

interface ITooltip {
	tooltip: ReactElement;
	link: string;
}
export const TOOLTIPS: Record<string, ITooltip> = {
	Leverage: {
		tooltip: (
			<span>
				Use of borrowed funds to increase your trading position
				<br />
				beyond what is available in your cash balance.
			</span>
		),
		link: 'https://docs.kollider.xyz/docs/trading#leverage',
	},
	'Mark / Liq. Price': {
		tooltip: (
			<span>
				<span className="font-bold">Mark Price</span>: Current price of the future.
				<br />
				Used for calculating UPNL and liquidation price.
				<br />
				<br />
				<span className="font-bold">Liquidation Price</span>: When the mark price reaches
				<br />
				this price, the position will be liquidated
			</span>
		),
		link: 'https://docs.kollider.xyz/docs/trading',
	},
	'Liq. Price': {
		tooltip: (
			<span>
				When the mark price reaches the liquidation price,
				<br />
				the position will be liquidated
			</span>
		),
		link: 'https://docs.kollider.xyz/docs/trading',
	},
	'Entry Price': {
		tooltip: <span>The Price the position was created at</span>,
		link: 'https://docs.kollider.xyz/docs/trading',
	},
	'UPNL/RPNL': {
		tooltip: (
			<span>
				UPNL = Unrealised profit or loss
				<br />
				RPNL = Realised profit or loss
			</span>
		),
		link: 'https://docs.kollider.xyz/docs/trading#upnlrpnl',
	},
	PNL: {
		tooltip: <span>Profit and Loss</span>,
		link: 'https://docs.kollider.xyz/docs/trading#upnlrpnl',
	},
	'TP / SL': {
		tooltip: <span>Take Profit / Stop Loss</span>,
		link: '',
	},
	'Next Funding Event': {
		tooltip: <span>The next time a funding rate happens. (Times in UTC)</span>,
		link: 'https://docs.kollider.xyz/docs/trading#funding',
	},
	Funding: {
		tooltip: (
			<span>
				The predicted funding rate applied to this position.
				<br />
				Based on the average 1hr funding rate
				{/*Longs pay shorts when positive.
				<br />
				Shorts pay longs when negative. */}
			</span>
		),
		link: 'https://docs.kollider.xyz/docs/trading#funding',
	},
	'1hr Avg Funding': {
		tooltip: (
			<span>
				The funding average value based on a 1 hour period.
				<br />
				Longs pay shorts when positive.
				<br />
				Shorts pay longs when negative.
			</span>
		),
		link: 'https://docs.kollider.xyz/docs/trading#funding',
	},
	'Mid Price': {
		tooltip: <span>The average of the highest bid order and lowest ask order</span>,
		link: 'https://docs.kollider.xyz/docs/trading',
	},
	'Index Price': {
		tooltip: (
			<span className="leading-tight">
				{/* Average of <Symbol /> */}
				USD
				<br />
				across major exchanges.
			</span>
		),
		link: 'https://docs.kollider.xyz/docs/trading#index-price',
	},
	'Mark Price': {
		tooltip: (
			<span className="leading-tight">
				Current price of the future.
				<br />
				Used for calculating UPNL and liquidation price.
			</span>
		),
		link: 'https://docs.kollider.xyz/docs/trading#mark-price',
	},
	Liquidation: {
		tooltip: <span>Whether the trade was the result of a liquidation</span>,
		link: 'https://docs.kollider.xyz/docs/trading#liquidation',
	},
	'Limit Price': {
		tooltip: <span>The price the limit order was created</span>,
		link: 'https://docs.kollider.xyz/docs/trading#limit-orders',
	},
	Fees: {
		tooltip: <span>Fees that will be paid</span>,
		link: 'https://docs.kollider.xyz/docs/fees',
	},
	'Fees Earned': {
		tooltip: <span>Fees that will be earned</span>,
		link: 'https://docs.kollider.xyz/docs/fees',
	},
	Available: {
		tooltip: (
			<span>
				Your available balance
				<br />
				(The amount you have on Kollider)
			</span>
		),
		link: '',
	},
	'Position Margin': {
		tooltip: <span>Your balance currently being used in open positions</span>,
		link: '',
	},
	'Position Value': {
		tooltip: <span>Position Margin x Leverage</span>,
		link: '',
	},
	'Order Margin': {
		tooltip: (
			<span>
				Your balance currently being used on open orders
				<br />
				(Unfilled limit orders in the order book)
			</span>
		),
		link: '',
	},
	'Order Value': {
		tooltip: <span>Leverage multiplied by required margin</span>,
		link: '',
	},
	Instant: {
		tooltip: (
			<span>
				Indicates if the lighting network will be used to fund the order.
				<br />
				When not used, a traders cash balance will be used.
			</span>
		),
		link: 'https://docs.kollider.xyz/docs/tutorials#opening-a-position',
	},
	'Margin Required': {
		tooltip: <span>The margin required to create this order</span>,
		link: 'https://docs.kollider.xyz/docs/tutorials#opening-a-position',
	},
	'Margin Returned': {
		tooltip: <span>The margin returned when you create this order</span>,
		link: 'https://docs.kollider.xyz/docs/tutorials#opening-a-position',
	},
	'Liquidation Price': {
		tooltip: <span>The price at which this position is closed.</span>,
		link: 'https://docs.kollider.xyz/docs/trading#liquidation',
	},
	AccountTotalMargin: {
		tooltip: (
			<span>
				Total amount of margin inside account
				<br />
				Available + Position + Open Orders
			</span>
		),
		link: '',
	},
	Spread: {
		tooltip: <span>The Price difference between the best bid and best ask</span>,
		link: '',
	},
	'Tick Size': {
		tooltip: <span>The minimum price movement for this market</span>,
		link: '',
	},
	'Maintenance Margin': {
		tooltip: (
			<span>
				The minimum percentage of collateral you must hold to keep your trading position open.
				<br /> If your margin balance drops below this percentage, you will be liquidated.
			</span>
		),
		link: '',
	},
	'Contract Size': {
		tooltip: <span>The value of 1 contract</span>,
		link: '',
	},
	ChangeMargin: {
		tooltip: (
			<span>
				Increase / Decrease the margin allocated to an open position,
				<br />
				affectively reducing / increasing leverage and risk
			</span>
		),
		link: '',
	},
	'': {
		tooltip: <span></span>,
		link: '',
	},
	Portfolio_PositionMargin: {
		tooltip: <span>Your balance currently being used in open positions</span>,
		link: '',
	},
	Portfolio_PortfolioValue: {
		tooltip: (
			<span className="break-all">
				The total amount in Kollider, including unrealized PNL,
				<br />
				margin used in open or pending positions, and cash balance.
			</span>
		),
		link: '',
	},
	Portfolio_PNL: {
		tooltip: <span className="break-all">Profit and Loss</span>,
		link: '',
	},
	Portfolio_ROI: {
		tooltip: (
			<span className="break-all">
				Profit made relative to margin requirement.
				<br />
				The current UPNL / total position margin.
			</span>
		),
		link: '',
	},
	'Portfolio_30d Fees': {
		tooltip: <span className="break-all">Fees you've paid or earned for 30 days.</span>,
		link: '',
	},
	'Portfolio_Position Value': {
		tooltip: (
			<span className="break-all">
				Total amount used in open positions,
				<br />
				including unrealised PNL
			</span>
		),
		link: '',
	},
};
