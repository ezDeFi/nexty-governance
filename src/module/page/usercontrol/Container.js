import { createContainer } from '@/util'
import Component from './Component'
// import NTFToken from '@/service/NTFToken'
import NtfTokenService from '@/service/contracts/ntfTokenService'
import NtfPoolService from '@/service/contracts/ntfPoolService'
import UserService from '@/service/UserService'
var curWallet = null
export default createContainer(Component, (state) => {
  //console.log('contract pool', state.contracts.ntfPool)
  const userService = new UserService()
  const ntfTokenService = new NtfTokenService()
  const ntfPoolService = new NtfPoolService()

  async function load () {
    await ntfPoolService.loadPool(state.pool.selectedPool)
    ntfPoolService.getPools(false)
    userService.getBalanceBeta()

    ntfTokenService.loadMyNtfBalance()

    ntfPoolService.loadPoolOwner()
    ntfPoolService.loadMyRewardBalance()
    ntfPoolService.loadMyDepositedNtf()
    ntfPoolService.loadUnlockTime()
    ntfPoolService.loadIsLocking()
    ntfPoolService.loadPoolNtfBalance()
    ntfPoolService.loadPoolNtyBalance()
    ntfPoolService.loadPoolStatus()
    ntfPoolService.loadMyPendingOutAmount()
  }
  if (state.user.wallet !== curWallet && !curWallet) {
    curWallet = state.user.wallet
    load()
    setInterval(() => {
      load()
    }, 5000)
  }

  return {
    pools: state.pool.pools,
    selectedPool: state.pool.selectedPool,
    wallet: state.user.wallet,
    balance: state.user.balance,
    myNtfBalance: state.user.ntfBalance.balance,
    myRewardBalance: state.user.rewardBalance,
    myNtfDeposited: state.user.ntfDeposited,
    myUnlockTime: state.user.unlockTime,
    poolNtfBalance: state.pool.poolNtfBalance.balance,
    poolNtyBalance: state.pool.poolNtyBalance,
    isLocking: state.user.isLocking,
    poolStatus: state.pool.status,
    name: state.pool.name,
    compRate: state.pool.compRate,
    website: state.pool.website,
    location: state.pool.location,
    logo: state.pool.logo,
    owner: state.pool.owner,
    myPendingOutAmount: state.user.myPendingOutAmount
  }
}, () => {
  const userService = new UserService()
  const ntfTokenService = new NtfTokenService()
  const ntfPoolService = new NtfPoolService()

  return {
    getName (_address) {
      return ntfPoolService.getName(_address)
    },
    async selectPool (_address) {
      return await ntfPoolService.selectPool(_address)
    },
    async approve (_amount) {
      return await ntfTokenService.approve(_amount)
    },
    async deposit (_amount) {
      return await ntfPoolService.deposit(_amount)
    },
    async requestOut (_amount) {
      return await ntfPoolService.requestOut(_amount)
    },
    async claim () {
      return await ntfPoolService.claim()
    },
    async withdraw () {
      return await ntfPoolService.withdraw()
    },
    async virtuellMining () {
      await ntfPoolService.virtuellMining()
    }
  }
})
