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
      return await nextyManagerService.callFunction(functionName, params)
    },

    async join (coinbase) {
      return await nextyManagerService.callFunction('join', coinbase)
    },

    async leave () {
      return await nextyManagerService.callFunction('leave', [])
    },

    getTransaction (hash) {
      return nextyManagerService.getTransaction(hash)
    },
    getTokenBalance (address) {
      return ntfTokenService.getTokenBalance(address)
    },
    getAllowance () {
      return ntfTokenService.getAllowance()
    },
    getMinNtfAmount () {
      return nextyManagerService.getMinNtfAmount()
    },
    getLockDuration () {
      return nextyManagerService.getLockDuration()
    },
    getDepositedBalance () {
      return nextyManagerService.getDepositedBalance()
    },
    getStatus () {
      return nextyManagerService.getStatus()
    },
    getCoinbase () {
      return nextyManagerService.getCoinbase()
    },
    getUnlockTime () {
      return nextyManagerService.getUnlockTime()
    },
    isWithdrawable () {
      return nextyManagerService.isWithdrawable()
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
