import { createContainer } from '@/util'
import Component from './Component'
// import NTFToken from '@/service/NTFToken'
// import NtfTokenService from '@/service/contracts/ntfTokenService'
import NtfPoolService from '@/service/contracts/ntfPoolService'
import UserService from '@/service/UserService'
import GetData from '@/service/getDataWS'
var curWallet = null
export default createContainer(Component, (state) => {
  const userService = new UserService()
  // const ntfTokenService = new NtfTokenService()
  const ntfPoolService = new NtfPoolService()

  async function loadOnInit () {
    console.log('loadOnInit')
    // userService.getWallet()
    // ntfPoolService.getPools()
    // load()
  }

  async function load () {
    console.log('loadInterval')
    userService.loadBlockNumber()

    // ntfPoolService.loadPoolAddress()
    // ntfPoolService.loadOwner()
    // ntfPoolService.loadFund()
    // ntfPoolService.loadPoolNtfBalance()
    // ntfPoolService.loadPoolNtyBalance()

    // ntfPoolService.loadPoolIsWithdrawable()
    // ntfPoolService.loadPoolUnlockHeight()
    // ntfPoolService.loadPoolDeposited()
    // ntfPoolService.loadPoolStatus()
    // ntfPoolService.loadPoolSigner()
    ntfPoolService.getPools()
  }

  if (state.user.wallet !== curWallet && !curWallet) {
    curWallet = state.user.wallet
    // loadOnInit()
    // setInterval(() => {
    //   load()
    // }, 5000)
  }
console.log('wallettt',state.user.wallet)
  return {
    wallet: state.user.wallet
  }
}, () => {
  const userService = new UserService()
  // const ntfTokenService = new NtfTokenService()GetData
  const ntfPoolService = new NtfPoolService()
  const getData = new GetData()

  return {
    async createPool (owner, compRate, maxLock, delay, name, website, location, logo) {
      return await getData.createPool(owner, compRate, maxLock, delay, name, website, location, logo)
    }
  }
})
