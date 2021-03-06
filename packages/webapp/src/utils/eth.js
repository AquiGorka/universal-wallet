import Web3 from 'web3';
import EthereumTx from 'ethereumjs-tx';

const {
  REACT_APP_TESTNET,
  REACT_APP_INFURA_API_KEY,
  REACT_APP_ETHERSCAN_API_KEY,
} = process.env;

const INFURA_URL = REACT_APP_TESTNET
  ? 'https://rinkeby.infura.io/'
  : 'https://mainnet.infura.io/';

const INFURA_NETWORK = `${INFURA_URL}${REACT_APP_INFURA_API_KEY}`;

const GAS_LIMIT_IN_WEI = 21000;

export const { eth, utils } = new Web3(
  new Web3.providers.HttpProvider(INFURA_NETWORK),
);

export const sendTx = async tx =>
  new Promise((resolve, reject) =>
    eth.sendSignedTransaction(`0x${tx.toString('hex')}`, (err, res) => {
      if (err) {
        reject(err);
      }
      resolve(res);
    }),
  );

export const balanceURL = REACT_APP_TESTNET
  ? `https://api-rinkeby.etherscan.io/api?module=account&action=balance&apikey=${REACT_APP_ETHERSCAN_API_KEY}&address=`
  : `https://api.etherscan.io/api?module=account&action=balance&apikey=${REACT_APP_ETHERSCAN_API_KEY}&address=`;

export const transactionsURL = REACT_APP_TESTNET
  ? `https://api-rinkeby.etherscan.io/api?module=account&action=txlist&apikey=${REACT_APP_ETHERSCAN_API_KEY}&address=`
  : `https://api.etherscan.io/api?module=account&action=txlist&startblock=0&endblock=99999999&apikey=${REACT_APP_ETHERSCAN_API_KEY}&address=`;

// chainId - mainnet: 1, rinkeby: 4
export const CHAIN_ID = REACT_APP_TESTNET ? 4 : 1;

export const NAME = 'Ethereum';

export const SYMBOL = 'eth';

export const URL_TX = REACT_APP_TESTNET
  ? 'https://rinkeby.etherscan.io/tx/'
  : 'https://etherscan.io/tx/';

export const getTxInfo = async () => {
  const priceInWei = await eth.getGasPrice();
  const aproxFeeInWei = GAS_LIMIT_IN_WEI * priceInWei;
  return {
    wei: {
      price: priceInWei,
      limit: GAS_LIMIT_IN_WEI,
      aproxFee: aproxFeeInWei,
    },
    ether: {
      limit: utils.fromWei(`${GAS_LIMIT_IN_WEI}`, 'ether'),
      price: utils.fromWei(`${priceInWei}`, 'ether'),
      aproxFee: utils.fromWei(`${aproxFeeInWei}`, 'ether'),
    },
    gwei: {
      limit: utils.fromWei(`${GAS_LIMIT_IN_WEI}`, 'gwei'),
      price: utils.fromWei(`${priceInWei}`, 'gwei'),
      aproxFee: utils.fromWei(`${aproxFeeInWei}`, 'gwei'),
    },
  };
};

export const validateAddress = utils.isAddress;

export const generateTx = async ({ to, from, privateKey: rawPK, amount }) => {
  const { privateKey } = eth.accounts.privateKeyToAccount(rawPK);
  const nonce = await eth.getTransactionCount(from);
  const valueInWei = utils.toWei(`${amount}`, 'ether');
  const gasPriceInWei = await eth.getGasPrice();
  const tx = new EthereumTx({
    to,
    from,
    nonce: utils.toHex(nonce),
    value: utils.toHex(valueInWei),
    gasPrice: utils.toHex(gasPriceInWei),
    gasLimit: utils.toHex(GAS_LIMIT_IN_WEI),
    chainId: CHAIN_ID,
  });
  tx.sign(Buffer.from(privateKey, 'hex'));
  return tx.serialize();
};

export const broadcast = async params => {
  const tx = await generateTx(params);
  return await sendTx(tx);
};

export const toPublicAddress = rawPK => {
  const privateKey = rawPK.indexOf('0x') === 0 ? rawPK : '0x' + rawPK;
  return eth.accounts.privateKeyToAccount(privateKey).address.toString('hex');
};

export const getBalance = async privateKey => {
  const raw = await fetch(balanceURL + toPublicAddress(privateKey));
  const { result } = await raw.json();
  return parseFloat(utils.fromWei(result, 'ether'));
};

export const getTransactions = async privateKey => {
  const raw = await fetch(transactionsURL + toPublicAddress(privateKey));
  const { result = [] } = await raw.json();
  return result;
};
