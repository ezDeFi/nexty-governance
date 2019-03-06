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

    async approve (amount) {
      return await ntfTokenService.approve(amount) // eslint-disable-line
    },
    async deposit (amount) {
      return await nextyManagerService.callFunction('deposit', [amount]) // eslint-disable-line
    },

    getTokenBalance (address) {
      ntfTokenService.getTokenBalance(address)
    },
    getAllowance () {
      ntfTokenService.getAllowance()
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

    // events
    getEventApproval () {
      return ntfTokenService.getEventApproval()
    },
    getEventDeposited () {
      return nextyManagerService.getEventDeposited()
    }
  }
})
