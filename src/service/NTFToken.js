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

    async joinQueue(params) {
        const storeUser = this.store.getState().user
        let {contract, web3, wallet} = storeUser.profile

        const functionDef = new SolidityFunction('', _.find(WEB3.PAGE["BinaryBetting"].ABI, { name: 'joinQueue' }), '')
        const payloadData = functionDef.toPayload(params).data
        const nonce = web3.eth.getTransactionCount(wallet.getAddressString())
        console.log(params);

        const rawTx = {
            nonce: nonce,
            from: wallet.getAddressString(),
            value: web3.toWei(params[0], "ether"),
            to: contract.BinaryBetting.address,
            data: payloadData
        }

        const gas = this.estimateGas(rawTx)
        rawTx.gas = gas

        return await this.sendRawTransaction(rawTx)
    }

    async joinRoom(params) {
        const storeUser = this.store.getState().user
        let {contract, web3, wallet} = storeUser.profile

        const functionDef = new SolidityFunction('', _.find(WEB3.PAGE["BinaryBetting"].ABI, { name: 'joinRoom' }), '')
        const payloadData = functionDef.toPayload(params).data
        const nonce = web3.eth.getTransactionCount(wallet.getAddressString())

        const rawTx = {
            nonce: nonce,
            from: wallet.getAddressString(),
            value: web3.toWei(params[0], "ether"),
            to: contract.BinaryBetting.address,
            data: payloadData
        }

        const gas = this.estimateGas(rawTx)
        rawTx.gas = gas

        return await this.sendRawTransaction(rawTx)
    }

    async leaveQueue() {
        return await this.callFunction("leaveQueue", [])
    }

    async sendHash(_hash) {
        return await this.callFunction("sendHash", [_hash])
    }

    async sendRandom(_random) {
        return await this.callFunction("sendHash", [_random])
    }

    async activeRoundFighting() {
        return await this.callFunction("activeRoundFighting", [])
    }

    //Read Functions

    async getAmounts() {
        const storeUser = this.store.getState().user
        let {contract} = storeUser.profile
        if (!contract) {
            return
        }
        return await contract.BinaryBetting.getAmounts()
    }

    async getFactors() {
        const storeUser = this.store.getState().user
        let {contract} = storeUser.profile
        if (!contract) {
            return
        }
        return await contract.BinaryBetting.getFactors()
    }

    async getRoomNumber(_amount, _factor) {
        const storeUser = this.store.getState().user
        let {contract} = storeUser.profile
        if (!contract) {
            return
        }
        return await Number(contract.BinaryBetting.getRoomNumber(_amount, _factor))
    }

    async getRoomState() {
        const storeUser = this.store.getState().user
        let {contract} = storeUser.profile
        if (!contract) {
            return
        }
        return await Number(contract.BinaryBetting.getRoomState())
    }

    async getPlayerState() {
        const storeUser = this.store.getState().user
        let {contract} = storeUser.profile
        if (!contract) {
            return
        }
        return await Number(contract.BinaryBetting.getPlayerState())
    }

    async getRoomId() {
        const storeUser = this.store.getState().user
        let {contract} = storeUser.profile
        if (!contract) {
            return
        }
        return await Number(contract.BinaryBetting.getRoomId())
    }

    async getRoomAmount() {
        const storeUser = this.store.getState().user
        let {contract} = storeUser.profile
        if (!contract) {
            return
        }
        return await Number(contract.BinaryBetting.getRoomAmount())
    }

    async getRoomFactor() {
        const storeUser = this.store.getState().user
        let {contract} = storeUser.profile
        if (!contract) {
            return
        }
        return await Number(contract.BinaryBetting.getRoomFactor())
    }

    async getRoomRestPlayers() {
        const storeUser = this.store.getState().user
        let {contract} = storeUser.profile
        if (!contract) {
            return
        }
        return await Number(contract.BinaryBetting.getRoomRestPlayers())
    }

    async roomAsleep() {
        const storeUser = this.store.getState().user
        let {contract} = storeUser.profile
        if (!contract) {
            return
        }
        return await Number(contract.BinaryBetting.roomAsleep())
    }

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

    getEventRoomLocked() {
        const storeUser = this.store.getState().user
        let {contract, web3, wallet} = storeUser.profile
        if (!contract) {
            return
        }
        return contract.BinaryBetting.RoomLocked()
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
