import { TOrderbook } from 'classes/Orderbook';

export const askBidSelector = (data: TOrderbook) => {
	const bestAsk = data.asks[data.asks.length - 1]?.[0];
	const bestBid = data.bids[0]?.[0];
	return {
		bestAsk,
		bestBid,
		bestAskAmount: data.asks[data.asks.length - 1]?.[1],
		bestBidAmount: data.bids[0]?.[1],
	};
};
