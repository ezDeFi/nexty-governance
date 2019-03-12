import { createContainer } from '@/util'
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
  const userService = new UserService()

  return {
    getWallet () {
      return userService.getWallet()
    },

    async callFunction (functionName, params) {
      return await nextyManagerService.callFunction(functionName, params) // eslint-disable-line
    },

    async join (coinbase) {
      return await nextyManagerService.callFunction('join', coinbase) // eslint-disable-line
    },

    async leave () {
      return await nextyManagerService.callFunction('leave', []) // eslint-disable-line
    },

    getTransaction (hash) {
      return nextyManagerService.getTransaction(hash)
    },
    getStakeLockHeight () {
      return nextyManagerService.getStakeLockHeight()
    },
    getTokenBalance (address) {
      ntfTokenService.getTokenBalance(address)
    },
    getAllowance () {
      ntfTokenService.getAllowance()
    },
    getMinNtfAmount () {
      nextyManagerService.getMinNtfAmount()
    },
    getUnlockHeight (_address) {
      nextyManagerService.getUnlockHeight(_address)
    },
    getCurBlock () {
      nextyManagerService.getCurBlock()
    },
    getDepositedBalance () {
      nextyManagerService.getDepositedBalance()
    },
    getStatus () {
      nextyManagerService.getStatus()
    },
    getCoinbase () {
      nextyManagerService.getCoinbase()
    },
    // getUnlockTime () {
    //   return nextyManagerService.getUnlockTime()
    // },
    isWithdrawable () {
      nextyManagerService.isWithdrawable()
    },

    // events
    getEventJoined () {
      return nextyManagerService.getEventJoined()
    },
    getEventLeft () {
      return nextyManagerService.getEventLeft()
    }
  }
})
