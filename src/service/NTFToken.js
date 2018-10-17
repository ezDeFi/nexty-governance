import BaseService from '../model/BaseService'
import _ from 'lodash'
import Tx from 'ethereumjs-tx'
const SolidityFunction = require('web3/lib/web3/function')
import {WEB3} from '@/constant'

export default class extends BaseService {

    //Basic Functions
    async callFunction(functionName, params) {
        const storeUser = this.store.getState().user
        let {contract, web3, wallet} = storeUser.profile
        
        const functionDef = new SolidityFunction('', _.find(WEB3.PAGE["BinaryBetting"].ABI, { name: functionName }), '')
        const payloadData = functionDef.toPayload(params).data

        const nonce = web3.eth.getTransactionCount(wallet.getAddressString()) 
        const rawTx = {
            nonce: nonce,
            from: wallet.getAddressString(),
            value: '0x0',
            to: contract.BinaryBetting.address,
            data: payloadData
        }
        //const gas = this.estimateGas(rawTx)
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
            //gas = 6021975
        } catch (err) {
            //gas = 300000
            gas = 300000
        }

        return gas
    }

    //Actions Function, cost gas

    async approve(_amount) {
        const storeUser = this.store.getState().user
        let {contract, web3, wallet} = storeUser.profile
        var params = [contract.NextyManager.address, _amount];
        const functionDef = new SolidityFunction('', _.find(WEB3.PAGE["NTFToken"].ABI, { name: 'approve' }), '')
        const payloadData = functionDef.toPayload(params).data
        const nonce = web3.eth.getTransactionCount(wallet.getAddressString())
        console.log(params);

        const rawTx = {
            nonce: nonce,
            from: wallet.getAddressString(),
            value: 0,
            to: contract.NTFToken.address,
            data: payloadData
        }

        const gas = this.estimateGas(rawTx)
        rawTx.gas = gas

        return await this.sendRawTransaction(rawTx)
    }

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

    //Read Functions

    //Events
    // event RoomLocked(uint256 _amount, uint256 _factor, uint256 _id);
    // event RoomCleaned(uint256 _amount, uint256 _factor, uint256 _id);
    
    // event JoinSuccess(address _address, uint256 _id);
    // event RefundSuccess(address _address,uint256 _amount);
    // event LeaveSuccess(address _address);
    
    // event BadNews(address _address);
    // event GoodNews(address _address, uint256 _amount);
    
    // event HashRequest(uint256 _amount, uint256 _factor, uint256 _id);
    // event HashSent(address _address);
    
    // event RandomRequest(uint256 _amount, uint256 _factor, uint256 _id);
    // event RandomSent(address _address);

    getEventApproval() {
        const storeUser = this.store.getState().user
        let {contract, web3, wallet} = storeUser.profile
        if (!contract) {
            return
        }
        return contract.NTFToken.Approval()
    }
    
    getEventRoomCleaned() {
        const storeUser = this.store.getState().user
        let {contract, web3, wallet} = storeUser.profile
        if (!contract) {
            return
        }
        return contract.BinaryBetting.RoomCleaned()
    }

    getEventJoinSuccess() {
        const storeUser = this.store.getState().user
        let {contract, web3, wallet} = storeUser.profile
        if (!contract) {
            return
        }
        return contract.BinaryBetting.JoinSuccess()
    }

    getEventRefundSuccess() {
        const storeUser = this.store.getState().user
        let {contract, web3, wallet} = storeUser.profile
        if (!contract) {
            return
        }
        return contract.BinaryBetting.RefundSuccess()
    }

    getEventBadNews() {
        const storeUser = this.store.getState().user
        let {contract, web3, wallet} = storeUser.profile
        if (!contract) {
            return
        }
        return contract.BinaryBetting.BadNews()
    }

    getEventGoodNews() {
        const storeUser = this.store.getState().user
        let {contract, web3, wallet} = storeUser.profile
        if (!contract) {
            return
        }
        return contract.BinaryBetting.GoodNews()
    }

    getEventHashRequest() {
        const storeUser = this.store.getState().user
        let {contract, web3, wallet} = storeUser.profile
        if (!contract) {
            return
        }
        return contract.BinaryBetting.HashRequest()
    }

    getEventRandomRequest() {
        const storeUser = this.store.getState().user
        let {contract, web3, wallet} = storeUser.profile
        if (!contract) {
            return
        }
        return contract.BinaryBetting.RandomRequest()
    }

    getEventHashSent() {
        const storeUser = this.store.getState().user
        let {contract, web3, wallet} = storeUser.profile
        if (!contract) {
            return
        }
        return contract.BinaryBetting.HashSent()
    }

    getEventRandomSent() {
        const storeUser = this.store.getState().user
        let {contract, web3, wallet} = storeUser.profile
        if (!contract) {
            return
        }
        return contract.BinaryBetting.RandomSent()
    }

}
