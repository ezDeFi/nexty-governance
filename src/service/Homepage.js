import BaseService from '../model/BaseService'
import _ from 'lodash'
import Tx from 'ethereumjs-tx'
import { WEB3 } from '@/constant'

const SolidityFunction = require('web3/lib/web3/function')

export default class extends BaseService {
  //  Basic Functions
  async callFunction (functionName, params) {
    const storeUser = this.store.getState().user
    let { contract, web3, wallet } = storeUser.profile
    const functionDef = new SolidityFunction('', _.find(WEB3.PAGE['SPToken'].ABI, { name: functionName }), '')
    const payloadData = functionDef.toPayload(params).data

    const nonce = web3.eth.getTransactionCount(wallet.getAddressString())
    const rawTx = {
      nonce: nonce,
      from: wallet.getAddressString(),
      value: '0x0',
      to: contract.SPToken.address,
      data: payloadData
    }
    const gas = this.estimateGas(rawTx)
    rawTx.gas = gas
    return this.sendRawTransaction(rawTx)
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
    } catch (err) {
      // gas = 100000
      gas = 6021975
    }

    return gas
  }
}
