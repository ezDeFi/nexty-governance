import { createContainer } from '@/util'
import Component from './Component'
// import NTFToken from '@/service/NTFToken'
import NtfTokenService from '@/service/contracts/ntfTokenService'
import NtfPoolService from '@/service/contracts/ntfPoolService'
import UserService from '@/service/UserService'
var curWallet = null
export default createContainer(Component, (state) => {
  const userService = new UserService()
  const ntfTokenService = new NtfTokenService()
  const ntfPoolService = new NtfPoolService()
  async function load () {
    console.log('xxx')
    ntfPoolService.getPools(false)
  }
  if (state.user.wallet !== curWallet && !curWallet) {
    curWallet = state.user.wallet
    load()
    // setInterval(() => {
    //   load()
    // }, 5000)
  }

  return {
    pools: state.pool.pools,
    poolsPortal: state.pool.poolsPortal,
    loadingPortal: state.pool.loadingPortal,
    myPendingOutAmount: state.user.myPendingOutAmount,
  }
}, () => {
  const userService = new UserService()
  const ntfTokenService = new NtfTokenService()
  const ntfPoolService = new NtfPoolService()

  return {
    getName (_address) {
      return ntfPoolService.getName(_address)
    },
    async loadPoolPortal (pools) {
      // return await ntfPoolService.loadPoolPortal(pools)
    }
  }
})
