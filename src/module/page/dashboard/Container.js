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
      userService.getWallet()
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
    }
  }
})
