import {
  SHAPESHIFT_SEND_AMOUNT,
  SHAPESHIFT_VALIDATE_ADDRESS,
  SHAPESHIFT_MARKET_INFO,
  ETHER_SYMBOL_LOWER_CASED,
  BITCOIN_SYMBOL_LOWER_CASED,
} from './constants';
import { broadcast as btcBroadcast } from './btcTx';
import { broadcast as ethBroadcast } from './ethTx';

const AVAILABLE_SYMBOLS_FOR_BROADCAST = [
  BITCOIN_SYMBOL_LOWER_CASED,
  ETHER_SYMBOL_LOWER_CASED,
];

export const fetchMarketInfo = async (fromSymbol, toSymbol) => {
  const res = await fetch(
    `${SHAPESHIFT_MARKET_INFO}${fromSymbol.toLowerCase()}_${toSymbol.toLowerCase()}`,
  );
  return await res.json();
};

export const validAddressSymbol = async (address, symbol) => {
  const res = await fetch(`${SHAPESHIFT_VALIDATE_ADDRESS}${address}/${symbol}`);
  return await res.json();
};

export const placeOrder = async opts => {
  const res = await fetch(SHAPESHIFT_SEND_AMOUNT, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(opts),
  });
  const tx = await res.json();

  if (tx.hasOwnProperty('error')) {
    throw new Error(tx.error);
  }
  if (!tx.hasOwnProperty('success')) {
    throw new Error(JSON.stringify(tx));
  }
  return tx.success;
};

export const canBroadcast = symbol =>
  AVAILABLE_SYMBOLS_FOR_BROADCAST.includes(symbol.toLowerCase());

export const broadcast = async ({ fromSymbol, ...params }) => {
  return fromSymbol === ETHER_SYMBOL_LOWER_CASED
    ? ethBroadcast(params)
    : btcBroadcast(params);
};