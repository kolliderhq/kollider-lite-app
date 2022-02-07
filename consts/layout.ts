export const TABLES: Readonly<{ label: string; header: string[]; widths: string[] }[]> = Object.freeze([
	{
		label: 'Overview',
		header: [],
		widths: [],
	},
	{
		label: 'Positions',
		header: ['Symbol', 'Amount', 'Margin', 'Entry Price', 'Mark Price', 'Liq. Price', 'Leverage', 'PNL', 'Actions'],
		widths: ['10%', '10%', '15%', '10%', '10%', '10%', '10%', '15%', '10%'],
	},
	{
		label: 'Open Orders',
		header: ['Side', 'Limit Price', 'Filled', 'Amount', 'Cancel'],
		widths: ['10%', '25%', '25%', '25%', '15%'],
	},
	{
		label: 'Trades',
		header: ['Time', 'Side', 'Order Type', 'Amount', 'Price', 'RPNL', 'Fees'],
		widths: ['15%', '7.5%', '10%', '17.5%', '20%', '15%', '15%'],
	},
	//  above 3 are for main table

	{
		label: 'Leaderboard',
		header: ['Rank', 'Username', 'Mean Leverage', 'Trade Count', 'Total rpnl(SATS)', 'Total Volume(SATS)'],
		widths: ['5%', '20%', '15%', '15%', '20%', '25%'],
	},
	{
		label: 'Funding Rates',
		header: ['Time', 'Rate'],
		widths: ['50%', '50%'],
	},
	// {
	// 	label: 'Invoice',
	// 	header: ['Time', 'Side', 'Leverage', 'Price', 'Amount', 'View Invoice'],
	// 	widths: ['16.667%', '16.666%', '16.666%', '16.666%', '16.666%', '16.666%'],
	// },
]);