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
    return await this.sendRawTransaction(rawTx) // eslint-disable-line
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
    let { web3 } = storeUser.profile
    return web3.eth.getTransaction(hash)
  }

  // Read Functions
  getMinNtfAmount () {
    const userRedux = this.store.getRedux('user')
    const storeUser = this.store.getState().user
    let { contract } = storeUser.profile
    if (!contract) {
      return
    }

    contract.NextyManager.stakeRequire((err, result) => {
        this.dispatch(userRedux.actions.minNtfAmount_update(Number(result)))
    })
  }

  // getLockDuration () {
  //   const storeUser = this.store.getState().user
  //   let { contract } = storeUser.profile
  //   if (!contract) {
  //     return
  //   }
  //   return Number(contract.NextyManager.LOCK_DURATION())
  // }

  getUnlockHeight (_address) {
    const userRedux = this.store.getRedux('user')
    const storeUser = this.store.getState().user
    let { contract } = storeUser.profile
    if (!contract) {
      return
    }

    contract.NextyManager.getUnlockHeight('0x95e2fcBa1EB33dc4b8c6DCBfCC6352f0a253285d', (err, result) => (
        this.dispatch(userRedux.actions.unlockHeight_update(Number(result)))
    ))
  }

  getCurBlock () {
    const userRedux = this.store.getRedux('user')
    const storeUser = this.store.getState().user
    let { web3 } = storeUser.profile
    this.dispatch(userRedux.actions.currentBlock_update(Number(web3.eth.getBlockNumber())))
  }

  getDepositedBalance () {
    const userRedux = this.store.getRedux('user')
    const storeUser = this.store.getState().user
    let { contract, wallet } = storeUser.profile

    if (!contract) {
      return
    }

    contract.NextyManager.getBalance(wallet.getAddressString(), (err, result) => {
        console.log('result', result)
        this.dispatch(userRedux.actions.depositedBalance_update(Number(result)))
    })
  }

  getStatus () {
    const userRedux = this.store.getRedux('user')
    const storeUser = this.store.getState().user
    let { contract, wallet } = storeUser.profile
    if (!contract) {
      return
    }

    contract.NextyManager.getStatus('0x95e2fcBa1EB33dc4b8c6DCBfCC6352f0a253285d', (err, result) => {
        this.dispatch(userRedux.actions.managerStatus_update(Number(result)))
    })
  }

  getCoinbase () {
    const userRedux = this.store.getRedux('user')
    const storeUser = this.store.getState().user
    let { contract, wallet } = storeUser.profile

    contract.NextyManager.getCoinbase(wallet.getAddressString(), (err, result) => {
        this.dispatch(userRedux.actions.coinbase_update(result.toString()))
    })
  }

  getUnlockTime () {
    const userRedux = this.store.getRedux('user')
    const storeUser = this.store.getState().user
    let { contract, wallet } = storeUser.profile

    this.dispatch(userRedux.actions.unlockTime_update(this.getUnlockHeight(wallet.getAddressString()) - this.getCurBlock()))
  }

  isWithdrawable () {
    const userRedux = this.store.getRedux('user')

    const storeUser = this.store.getState().user
    let { contract, wallet } = storeUser.profile
    if (!contract) {
      return
    }

    contract.NextyManager.isWithdrawable(wallet.getAddressString(), (err, result) => {
        this.dispatch(userRedux.actions.isWithdrawable_update(Number(result)))
    })
  }

  // Events

  getEventDeposited () {
    const storeUser = this.store.getState().user
    let { contract } = storeUser.profile
    if (!contract) {
      return
    }
    return contract.NextyManager.Deposited()
  }

  getEventWithdrawn () {
    const storeUser = this.store.getState().user
    let { contract } = storeUser.profile
    if (!contract) {
      return
    }
    return contract.NextyManager.Withdrawn()
  }

  getEventJoined () {
    const storeUser = this.store.getState().user
    let { contract } = storeUser.profile
    if (!contract) {
      return
    }
    return contract.NextyManager.Joined()
  }

  getEventLeft () {
    const storeUser = this.store.getState().user
    let { contract } = storeUser.profile
    if (!contract) {
      return
    }
    return contract.NextyManager.Left()
  }
}
