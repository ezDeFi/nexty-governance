import { createContainer } from '@/util'
import Component from './Component'
// import NTFToken from '@/service/NTFToken'
import NtfTokenService from '@/service/contracts/ntfTokenService'
import NextyManager from '@/service/NextyManager'
import UserService from '@/service/UserService'
var curWallet = null
export default createContainer(Component, (state) => {
  const ntfTokenService = new NtfTokenService()
  const nextyManagerService = new NextyManager()

  async function load () {
    nextyManagerService.getStatus()
    nextyManagerService.getDepositedBalance()
    nextyManagerService.getMinNtfAmount()
    nextyManagerService.getStakeLockHeight()
    ntfTokenService.loadMyNtfBalance()
  }
  if (state.user.wallet !== curWallet && !curWallet) {
    curWallet = state.user.wallet
    load()
    // setInterval(() => {
    //   load()
    // }, 5000)
  }
  return {
    ...state.user,
    myNtfBalance: state.user.ntfBalance.balance
  }
}, () => {
  const ntfTokenService = new NtfTokenService()
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
      sessionStorage.setItem('signerAddress', coinbase)
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
    loadMyNtfBalance () {
      ntfTokenService.loadMyNtfBalance()
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
