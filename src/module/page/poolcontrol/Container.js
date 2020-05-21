import { createContainer } from '@/util'
import Component from './Component'
// import NTFToken from '@/service/NTFToken'
import NtfTokenService from '@/service/contracts/ntfTokenService'
import NtfPoolService from '@/service/contracts/ntfPoolService'
import UserService from '@/service/UserService'
var curWallet = null
const oneHour = 60*60
const oneDay = 24 * oneHour

export default createContainer(Component, (state) => {
  const userService = new UserService()
  const ntfTokenService = new NtfTokenService()
  const ntfPoolService = new NtfPoolService()

  async function loadOnInit () {
    // ntfPoolService.loadLockDuration()
    // ntfPoolService.loadMaxLockDuration()
    ntfPoolService.loadMyCurrentPool()
    ntfPoolService.loadPoolInfo()
    load()
  }

  async function load () {
    let _selectedPool = await ntfPoolService.getPools(true)
    if (await !_selectedPool) return
    ntfPoolService.loadFund()
    ntfPoolService.loadPoolNtfBalance()
    ntfPoolService.loadPoolNtyBalance()

    ntfPoolService.loadPoolIsWithdrawable()
    ntfPoolService.loadPoolUnlockHeight()
    ntfPoolService.loadPoolDeposited()
    ntfPoolService.loadPoolInfo()
    ntfPoolService.loadPoolSigner()
  }

  if (state.user.wallet !== curWallet && !curWallet) {
    curWallet = state.user.wallet
    // loadOnInit()
    // setInterval(() => {
    //   load()
    // }, 5000)
  }

  return {
    mySelectedPool: state.pool.mySelectedPool,
    myPools: state.pool.myPools,
    pools: state.pool.pools,
    name: state.pool.name,
    compRate: state.pool.compRate,
    website: state.pool.website,
    location: state.pool.location,
    logo: state.pool.logo,
    owner: state.pool.owner,
    ownerBalance: state.pool.ownerBalance,
    fund: state.pool.fund,
    poolNtfBalance: state.pool.poolNtfBalance,
    poolNtyBalance: state.pool.poolNtyBalance,
    poolStatus: state.pool.status,
    signer: state.pool.signer,
    unlockHeight: state.pool.unlockHeight,
    blockNumber: state.user.blockNumber,
    lockDuration: Number(state.pool.lockDuration) / oneDay,
    maxLockDuration: Number(state.pool.maxLockDuration) / oneDay,
    ownerDelay: Number(state.pool.ownerDelay) / oneHour,
    stakeRequire: state.pool.stakeRequire
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
      await ntfPoolService.selectMyPool(_address)
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
    },
    async approve (amount) {
      await ntfTokenService.approve(amount)
    },
    async deposit (amount) {
      await ntfPoolService.deposit(amount)
    }
  }
})
