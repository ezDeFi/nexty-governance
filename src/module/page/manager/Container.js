import {createContainer} from '@/util'
import Component from './Component'
import NTFToken from '@/service/NTFToken'
import NextyManager from '@/service/NextyManager'
import UserService from '@/service/UserService'

export default createContainer(Component, (state) => {
    return {
        ...state.user
    }
}, () => {
    const ntfTokenService = new NTFToken()
    const nextyManagerService = new NextyManager()
    const userService= new UserService()

    return {
        getWallet() {
            return userService.getWallet()
        },

        async callFunction(functionName, params) {
            return await nextyManagerService.callFunction(functionName, params)
        },

        async join(coinbase) {
            return await nextyManagerService.join(coinbase)
        },

        async leave() {
            return await nextyManagerService.leave()
        },

        getTokenBalance(address) {
            return ntfTokenService.getTokenBalance(address)
        },
        getAllowance() {
            return ntfTokenService.getAllowance()
        },
        getMinNtfAmount() {
            return nextyManagerService.getMinNtfAmount()
        },
        getLockDuration() {
            return nextyManagerService.getLockDuration()
        },
        getDepositedBalance() {
            return nextyManagerService.getDepositedBalance()
        },
        getStatus() {
            return nextyManagerService.getStatus()
        },
        getCoinbase() {
            return nextyManagerService.getCoinbase()
        },
        getUnlockTime() {
            return nextyManagerService.getUnlockTime()
        },
        isWithdrawable() {
            return nextyManagerService.isWithdrawable()
        },


        getEventJoined() {
            return nextyManagerService.getEventJoined()
        },
        getEventLeft() {
            return nextyManagerService.getEventLeft()
        },
        /*
        async getFund() {
            return await contractService.getFund()
        },
        async getFundBonus() {
            return await contractService.getFundBonus()
        },
        async getPackagesInfo() {
            return await contractService.getPackagesInfo()
        }
        */
    }
})
