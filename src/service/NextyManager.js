import BaseService from '../model/BaseService'
import _ from 'lodash'
import Tx from 'ethereumjs-tx'
import { WEB3 } from '@/constant'
const SolidityFunction = require('web3/lib/web3/function')

export default class extends BaseService {
  // Basic Functions
  async callFunction (functionName, params) {
    const storeUser = this.store.getState().user
    let { contract, web3, wallet } = storeUser.profile

    const functionDef = new SolidityFunction('', _.find(WEB3.PAGE['NextyManager'].ABI, { name: functionName }), '')
    const payloadData = functionDef.toPayload(params).data

    const nonce = web3.eth.getTransactionCount(wallet.getAddressString())
    const rawTx = {
      nonce: nonce,
      from: wallet.getAddressString(),
      value: '0x0',
      to: contract.NextyManager.address,
      data: payloadData
    }
    // const gas = this.estimateGas(rawTx)
    const gas = 8000000
    rawTx.gas = gas
    return await this.sendRawTransaction(rawTx)
  }

  sendRawTransaction (rawTx) {
    const storeUser = this.store.getState().user
    let { web3, wallet } = storeUser.profile

    const privatekey = wallet.getPrivateKey()
    const tx = new Tx(rawTx)
    tx.sign(privatekey)
    const serializedTx = tx.serialize()

    return web3.eth.sendRawTransaction('0x' + serializedTx.toString('hex'))
  }

  estimateGas (rawTx) {
    const storeUser = this.store.getState().user
    let { web3 } = storeUser.profile
    let gas

    try {
      gas = web3.eth.estimateGas(rawTx)
      // gas = 6021975
    } catch (err) {
      // gas = 300000
      gas = 300000
    }

    return gas
  }

  getTransaction (hash) {
    const storeUser = this.store.getState().user
    let { contract, web3, wallet } = storeUser.profile
    return web3.eth.getTransaction(hash)
  }

  // Read Functions
  getMinNtfAmount () {
    const storeUser = this.store.getState().user
    let { contract, web3, wallet } = storeUser.profile
    if (!contract) {
      return
    }
    return Number(contract.NextyManager.MIN_NTF_AMOUNT())
  }

  getLockDuration () {
    const storeUser = this.store.getState().user
    let { contract, web3, wallet } = storeUser.profile
    if (!contract) {
      return
    }
    return Number(contract.NextyManager.LOCK_DURATION())
  }

  getDepositedBalance () {
    const storeUser = this.store.getState().user
    let { contract, web3, wallet } = storeUser.profile
    if (!contract) {
      return
    }
    return Number(contract.NextyManager.getBalance(wallet.getAddressString()))
  }

  getStatus () {
    const storeUser = this.store.getState().user
    let { contract, web3, wallet } = storeUser.profile
    if (!contract) {
      return
    }
    return Number(contract.NextyManager.getStatus(wallet.getAddressString()))
  }

  getCoinbase () {
    const storeUser = this.store.getState().user
    let { contract, web3, wallet } = storeUser.profile
    if (!contract) {
      return
    }
    return (contract.NextyManager.getCoinbase(wallet.getAddressString())).toString()
  }

  getUnlockTime () {
    const storeUser = this.store.getState().user
    let { contract, web3, wallet } = storeUser.profile
    if (!contract) {
      return
    }
    return Number(contract.NextyManager.getUnlockTime(wallet.getAddressString())) * 1000
  }

  isWithdrawable () {
    const storeUser = this.store.getState().user
    let { contract, web3, wallet } = storeUser.profile
    if (!contract) {
      return
    }
    return Number(contract.NextyManager.isWithdrawable(wallet.getAddressString()))
  }

  // Events

  getEventDeposited () {
    const storeUser = this.store.getState().user
    let { contract, web3, wallet } = storeUser.profile
    if (!contract) {
      return
    }
    return contract.NextyManager.Deposited()
  }

  getEventWithdrawn () {
    const storeUser = this.store.getState().user
    let { contract, web3, wallet } = storeUser.profile
    if (!contract) {
      return
    }
    return contract.NextyManager.Withdrawn()
  }

  getEventJoined () {
    const storeUser = this.store.getState().user
    let { contract, web3, wallet } = storeUser.profile
    if (!contract) {
      return
    }
    return contract.NextyManager.Joined()
  }

  getEventLeft () {
    const storeUser = this.store.getState().user
    let { contract, web3, wallet } = storeUser.profile
    if (!contract) {
      return
    }
    return contract.NextyManager.Left()
  }
}
