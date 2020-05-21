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

  async function loadOnInit () {
    console.log('loadOnInit')

    ntfPoolService.getPools()
    load()
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
    loadOnInit()
    setInterval(() => {
      load()
    }, 5000)
  }

  return {
    wallet: state.user.wallet,
    address: state.pool.address,
    owner: state.pool.owner,
    ownerBalance: state.pool.ownerBalance,
    fund: state.pool.fund,
    poolNtfBalance: state.pool.poolNtfBalance,
    poolNtyBalance: state.pool.poolNtyBalance,
    poolStatus: state.pool.status,
    signer: state.pool.signer,
    unlockHeight: state.pool.unlockHeight,
    blockNumber: state.user.blockNumber,
    lockDuration: state.pool.lockDuration,
    maxLockDuration: state.pool.maxLockDuration,
    ownerDelay: state.pool.ownerDelay,
    stakeRequire: state.pool.stakeRequire,
    pools: state.pool.pools
  }
}, () => {
  const userService = new UserService()
  const ntfTokenService = new NtfTokenService()
  const ntfPoolService = new NtfPoolService()

  return {
    async createPool (owner, compRate, maxLock, delay, name, website, location, logo) {
      return await ntfPoolService.createPool(owner, compRate, maxLock, delay, name, website, location, logo)
    },
    async getPools () {
      await ntfPoolService.getPools()
    },
    async virtuellMining () {
      await ntfPoolService.virtuellMining()
    },
    async claimFund () {
      await ntfPoolService.claimFund()
    },
    async joinGov (_signer) {
      await ntfPoolService.joinGov(_signer)
    },
    async leaveGov () {
      await ntfPoolService.leaveGov()
    },
    async tokenPoolWithdraw () {
      await ntfPoolService.tokenPoolWithdraw()
    },
    async setLockDuration (_lockDuration) {
      await ntfPoolService.setLockDuration(_lockDuration)
    }
  }
})
