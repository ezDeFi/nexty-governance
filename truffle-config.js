require('dotenv').config();
require('babel-register');
require('babel-polyfill');

module.exports = {
  networks: {
    development: {
      host: 'localhost',
      port: 8545,
      network_id: '*', // eslint-disable-line camelcase
    },
    coverage: {
      host: 'localhost',
      network_id: '*', // eslint-disable-line camelcase
      port: 8555,
      gas: 0xfffffffffff,
      gasPrice: 0x01,
    },
    ganache: {
      host: 'localhost',
      port: 8545,
      network_id: '*', // eslint-disable-line camelcase
      from: '0x7165E6d65046a7d8270B59Ea5bE5148cc13a2Dd4',
    },
    rinkeby: {
      host: 'localhost',
      port: 8545,
      network_id: '4', // eslint-disable-line camelcase
      from: '0x2f40cc3bd20608d382645d12d968aec6f27c7754', // account from which to deploy
      gas: 6612388,
      gasPrice: 20000000000,
    },
  },
};
