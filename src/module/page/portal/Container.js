import { createContainer } from '@/util'
import Component from './Component'
// import NTFToken from '@/service/NTFToken'
import NtfTokenService from '@/service/contracts/ntfTokenService'
import NtfPoolService from '@/service/contracts/ntfPoolService'
import UserService from '@/service/UserService'
import WS from '@/service/getDataWS'

var curWallet = null
// const govAddress = '0x0000000000000000000000000000000000012345'

export default createContainer(Component, (state) => {
  const ws = new WS()
  const userService = new UserService()
  const ntfTokenService = new NtfTokenService()
  const ntfPoolService = new NtfPoolService()
  async function load () {
    // ntfPoolService.getPools(false)
    ws.getPools()
    // ws.test()
    ws.loadLeaked()
  }
  if (state.user.wallet !== curWallet && !curWallet) {
    curWallet = state.user.wallet
    load()
    // setInterval(() => {
    //   load()
    // }, 5000)
  }
  // console.log('count',state.newPool.poolCount)
  // console.log('name',state.newPool.poolsPortal)
  return {
    name: state.newPool.name,
    // logo: state.newPool.logo,
    // compRate: state.newPool.compRate,
    // status: state.newPool.status,
    // holdingNtfBalance: state.newPool.holdingNtfBalance,
    // govNtfBalance: state.newPool.govNtfBalance,
    // holdingNtyBalance: state.newPool.holdingNtyBalance,
    // poolCount: state.newPool.poolCount,
    loadedTo: state.newPool.poolCount,
    // pools: state.pool.pools,
    poolsPortal: Object.values(state.newPool.poolsPortal),
    // loadingPortal: state.pool.loadingPortal,
    // myPendingOutAmount: state.user.myPendingOutAmount,
  }
}, () => {
  const userService = new UserService()
  const ntfTokenService = new NtfTokenService()
  const ntfPoolService = new NtfPoolService()

  return {
    // getName (_address) {
    //   return ntfPoolService.getName(_address)
    // },
    // async loadPoolPortal (pools) {
    //   // return await ntfPoolService.loadPoolPortal(pools)
    // }
  }
})
