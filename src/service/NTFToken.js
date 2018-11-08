import BaseService from '../model/BaseService'
import _ from 'lodash'
import Tx from 'ethereumjs-tx'
import {WEB3} from '@/constant'
const SolidityFunction = require('web3/lib/web3/function')

export default class extends BaseService {

    // Basic Functions
    async callFunction(functionName, params) {
        const storeUser = this.store.getState().user
        let {contract, web3, wallet} = storeUser.profile

        const functionDef = new SolidityFunction('', _.find(WEB3.PAGE['NTFToken'].ABI, { name: functionName }), '')
        const payloadData = functionDef.toPayload(params).data

        const nonce = web3.eth.getTransactionCount(wallet.getAddressString())
        const rawTx = {
            nonce: nonce,
            from: wallet.getAddressString(),
            value: '0x0',
            to: contract.NTFToken.address,
            data: payloadData
        }
        // const gas = this.estimateGas(rawTx)
        console.log(functionName, params)
        const gas = 8000000
        rawTx.gas = gas
        return await this.sendRawTransaction(rawTx)
    }

    sendRawTransaction(rawTx) {
        const storeUser = this.store.getState().user
        let {web3, wallet} = storeUser.profile

        const privatekey = wallet.getPrivateKey()
        const tx = new Tx(rawTx)
        tx.sign(privatekey)
        const serializedTx = tx.serialize()

        return web3.eth.sendRawTransaction('0x' + serializedTx.toString('hex'))
    }

    estimateGas(rawTx) {
        const storeUser = this.store.getState().user
        let {web3} = storeUser.profile
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

    async approve(amount) {
        var toAddress = WEB3.PAGE['NextyManager'].ADDRESS
        return await this.callFunction('approve', [toAddress, amount])
    }

    // Read Functions
    getTokenBalance(address) {
        const storeUser = this.store.getState().user
        let {contract} = storeUser.profile
        if (!contract) {
            return
        }
        return Number(contract.NTFToken.balanceOf(address))
    }

    getAllowance() {
        const storeUser = this.store.getState().user
        let {contract, web3, wallet} = storeUser.profile
        if (!contract) {
            return
        }
        return Number(contract.NTFToken.allowance(wallet.getAddressString(), contract.NextyManager.address))
    }

    // Events

    getEventApproval() {
        const storeUser = this.store.getState().user
        let {contract, web3, wallet} = storeUser.profile
        if (!contract) {
            return
        }
        return contract.NTFToken.Approval()
    }

    getEventTransfer() {
        const storeUser = this.store.getState().user
        let {contract, web3, wallet} = storeUser.profile
        if (!contract) {
            return
        }
        return contract.NTFToken.Transfer()
    }

}
