const GovernanceData = require('./../build/contracts/NextyGovernance.json')
const big = require('../lib/big.js')
const Web3 = require('web3');
const _ = require('lodash');

const args = process.argv
const action = args[2]
const network = args[3]
switch (network) {
  case 'local':
    var endPoint = 'http://localhost:8545'
    networkId = 111111
    break;
  case 'prod':
    var endPoint = 'https://rpc.nexty.io'
    networkId = 66666
    break;
  case 'dev':
  default:
    var endPoint = 'http://rpc.testnet.nexty.io:8545'
    networkId = 111111
}

const GovernanceAddress = '0x0000000000000000000000000000000000012345'

const CONTRACTS =
  {
    'Governance':
      {
        'abi': GovernanceData.abi,
        'address': GovernanceAddress,
      },
  }

const web3 = new Web3(new Web3.providers.HttpProvider(endPoint))
const gov = new web3.eth.Contract(CONTRACTS.Governance.abi, CONTRACTS.Governance.address)

const keys = {
  '0xd638dc353687169d117df1933ba93fcc1ff42834': '4c668fce6f03044f74ccd256b837a485a809562a55947abdfcb934d8cf8fe631',
  '0x71e2ecb267a79fa7d026559aba3a10ee569f4176': '0f2e668a2374c2e19e55520ce65a5f95b3597fd08013fd35bc2de23a917d2ba0',
}
const acc = '0xd638dc353687169d117df1933ba93fcc1ff42834'
const key = '4c668fce6f03044f74ccd256b837a485a809562a55947abdfcb934d8cf8fe631'

const account = web3.eth.accounts.privateKeyToAccount('0x' + key);
web3.eth.accounts.wallet.add(account);
web3.eth.defaultAccount = account.address;

const actions =  {
  async join() {
    const balance = await web3.eth.getBalance(acc, 'pending');
    console.log('balance', coinDisplay(balance))
    const deposited = await gov.methods.getBalance(acc).call()
    console.log('deposited', coinDisplay(deposited))
    const stakeRequire = await gov.methods.stakeRequire().call()
    console.log('require', coinDisplay(stakeRequire))
    const need = BigInt(stakeRequire) - BigInt(deposited)
    console.log('need', coinDisplay(need))
    if (need > 0) {
      /* the new deposit method on receive */
      // await web3.eth.sendTransaction({
      //   from: acc,
      //   value: need.toString(),
      //   to: gov._address,
      //   gas: 100000,
      // }).then(receipt => console.log(receipt.transactionHash))

      /* the legacy deposit method is also valid */
      await gov.methods.deposit().send({
        from: acc,
        value: need.toString(),
        gas: 100000,
      }).then(receipt => console.log(receipt.transactionHash));
    }
    await gov.methods.join('0x101e0fda41aeacc2deec587afa3506819a788667').send({from: acc, gas: 1000000})
      .then(receipt => console.log(receipt.transactionHash))
  },

  async leave() {
    await gov.methods.leave().send({from: acc, gas: 1000000})
      .then(receipt => console.log(receipt.transactionHash))
      .catch(err => console.error(err))
    const deposited = await gov.methods.getBalance(acc).call()
    console.log('deposited', coinDisplay(deposited))
    if (deposited > 0) {
      await gov.methods.withdraw().send({from: acc, gas: 100000})
        .then(receipt => console.log(receipt.transactionHash));
    }
  }
}

function coinDisplay(wei, decimals = 18) {
  return big.thousands(big.decShift(wei, -decimals))
}

actions[action]()