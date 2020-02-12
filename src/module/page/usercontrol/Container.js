import { createContainer } from '@/util'
import Component from './Component'
// import NTFToken from '@/service/NTFToken'
import NtfTokenService from '@/service/contracts/ntfTokenService'
import NtfPoolService from '@/service/contracts/ntfPoolService'
import UserService from '@/service/UserService'
var curWallet = null

export default createContainer(Component, (state) => {
  // console.log('contract pool', state.contracts.ntfPool)
  const userService = new UserService()
  const ntfTokenService = new NtfTokenService()
  const ntfPoolService = new NtfPoolService()

  async function load () {
    ntfPoolService.getPools(false)
    await ntfPoolService.loadCurrentPool()
    // ntfPoolService.getPools(false)
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
    ntfPoolService.loadPoolDeposited()
  }
  if (state.user.wallet !== curWallet && !curWallet) {
    curWallet = state.user.wallet
    load()
    // setInterval(() => {
    //   load()
    // }, 5000)
  }

  return {
    depositing: state.user.depositing,
    pools: state.pool.pools,
    selectedPool: state.pool.selectedPool,
    wallet: state.user.wallet,
    balance: state.user.balance,
    myNtfBalance: state.user.ntfBalance.balance,
    myRewardBalance: state.user.rewardBalance,
    myNtfDeposited: state.user.ntfDeposited,
    myUnlockTime: state.user.unlockTime,
    poolNtfBalance: state.pool.poolNtfBalance.balance,
    poolNtfDeposited: state.pool.poolDeposited,
    poolNtyBalance: state.pool.poolNtyBalance,
    isLocking: state.user.isLocking,
    poolStatus: state.pool.status,
    name: state.pool.name,
    compRate: state.pool.compRate,
    website: state.pool.website,
    location: state.pool.location,
    logo: state.pool.logo,
    owner: state.pool.owner,
    myPendingOutAmount: state.user.myPendingOutAmount,
    lockDuration: state.pool.lockDuration
  }
}, () => {
  const userService = new UserService()
  const ntfTokenService = new NtfTokenService()
  const ntfPoolService = new NtfPoolService()

  async function load () {
    await ntfPoolService.loadCurrentPool()
    // ntfPoolService.getPools(false)
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

  return {
    reload () {
      load()
    },
    getName (_address) {
      return ntfPoolService.getName(_address)
    },
    async depositProcess () {
      return userService.depositProcess()
    },
    async depositStop () {
      return userService.depositStop()
    },
    async listenToDeposit () {
      return ntfPoolService.listenToDeposit()
    },
    async loadPool (_address) {
      return ntfPoolService.loadPool(_address)
    },
    async selectPool (_address) {
      return ntfPoolService.selectPool(_address)
    },
    async approve (_amount) {
      return ntfTokenService.approve(_amount)
    },
    async deposit (_amount) {
      return ntfPoolService.deposit(_amount)
    },
    async requestOut (_amount) {
      return ntfPoolService.requestOut(_amount)
    },
    async claim () {
      return ntfPoolService.claim()
    },
    async withdraw () {
      return ntfPoolService.withdraw()
    },
    async virtuellMining () {
      ntfPoolService.virtuellMining()
    }
  }
})
