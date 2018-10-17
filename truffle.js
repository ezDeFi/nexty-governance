/*
 * NB: since truffle-hdwallet-provider 0.0.5 you must wrap HDWallet providers in a 
 * function when declaring them. Failure to do so will cause commands to hang. ex:
 * ```
 * mainnet: {
 *     provider: function() { 
 *       return new HDWalletProvider(mnemonic, 'https://mainnet.infura.io/<infura-key>') 
 *     },
 *     network_id: '1',
 *     gas: 4500000,
 *     gasPrice: 10000000000,
 *   },
 */

//module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
//};

require('dotenv').config();
require('babel-register');
require('babel-polyfill');

const HDWalletProvider = require('truffle-hdwallet-provider');
const HDmnemonic= "accident people carpet dice ring diary produce base want shrimp melt side"

const providerWithMnemonic = (mnemonic, rpcEndpoint) =>
  new HDWalletProvider(mnemonic, rpcEndpoint);

const infuraProvider = network => providerWithMnemonic(
  process.env.MNEMONIC || '',
  `https://${network}.infura.io/${process.env.INFURA_API_KEY}`
);

const PrivateKeyProvider = require('truffle-privatekey-provider');
const pkey= '2377F0B216DB206C05E38949C7EE98D52F02B00DC7FC698B7B509EA62F9AB2F7';
//address 0x21a790077be4f722a9bd773b7b78f7e7c2cc6e42  
const ropstenProvider = process.env.SOLIDITY_COVERAGE
  ? undefined
  : infuraProvider('ropsten');

module.exports = {
  networks: {
    development: {
      host: 'localhost',
      port: 8545,
      network_id: 'ganache', // eslint-disable-line camelcase
    },
    testnetNexty: {
      provider: () =>
      new PrivateKeyProvider(
        pkey,
        `http://125.212.250.61:11111`,
      ),
      gas: 21000000000000,
      gasPrice: 300000,
      network_id: 66666, // eslint-disable-line camelcase
    },
    mainnetNexty: {
      provider: () =>
      new PrivateKeyProvider(
        pkey,
        `http://13.228.68.50:8545`,
      ),
      gas: 7000000,
      gasPrice: 21000,
      network_id: 66666, // eslint-disable-line camelcase
    },
    ropsten: {
      provider: ropstenProvider,
      network_id: 3, // eslint-disable-line camelcase
    },
    coverage: {
      host: 'localhost',
      network_id: '*', // eslint-disable-line camelcase
      port: 8555,
      gas: 0xfffffffffff,
      gasPrice: 0x01,
    }
  }
}
