import BaseService from '../../model/BaseService'
import Web3 from 'web3'
import _ from 'lodash' // eslint-disable-line
import { WEB3, CONTRACTS, MIN_POOL_NTF, JSON_POOLS, JSON_POOLDETAILS } from '@/constant'
import { stringify } from 'postcss';

export default class extends BaseService {
  async createPool (owner, compRate, maxLock, delay, name, website, location, logo) {
    const store = this.store.getState()
    let methods = store.contracts.poolMaker.methods
    let wallet = store.user.wallet
    //console.log(owner, compRate, maxLock, delay, name, website, location, logo)
    let res = await methods.createPool(owner, compRate.toString(), maxLock.toString(), delay.toString(), name, website, location, logo).send({from: wallet, gasPrice: '0' })
    await console.log(res)
  }

  async loadMyCurrentPool () {
    const store = this.store.getState()
    //console.log('my current Pool', store.pool.mySelectedPool)
    await this.selectPool(store.pool.mySelectedPool)
  }

  async selectMyPool (_address) {
    let poolRedux = this.store.getRedux('pool')
    await this.dispatch(poolRedux.actions.mySelectedPool_update(_address))
    this.loadMyCurrentPool()
  }

  async selectPool (_address) {
    console.log('selectPool', _address)

    let poolRedux = this.store.getRedux('pool')
    await this.dispatch(poolRedux.actions.selectedPool_update(_address))
    const store = this.store.getState()
    console.log('store', store.pool.selectedPool)
    //this.loadPool(_address)
  }

  async loadPool (_address) {
    const store = this.store.getState()
    let contractsRedux = this.store.getRedux('contracts')
    let web3 = store.user.web3
    if (!web3) return
    let selectedNtfPool = new web3.eth.Contract(WEB3.PAGE['NtfPool'].ABI, _address)
    //let selectedNtfPool = new web3.eth.Contract(CONTRACTS.NtfPool.abi, _address)
    await this.dispatch(contractsRedux.actions.ntfPool_update(selectedNtfPool))
    await this.loadPoolInfo()
  }

  async loadCurrentPool () {
    const store = this.store.getState()
    let _address = store.pool.selectedPool
    let contractsRedux = this.store.getRedux('contracts')
    let web3 = store.user.web3
    if (!web3) return
    console.log('xxx')
    let selectedNtfPool = new web3.eth.Contract(WEB3.PAGE['NtfPool'].ABI, _address)
    //let selectedNtfPool = new web3.eth.Contract(CONTRACTS.NtfPool.abi, _address)
    await this.dispatch(contractsRedux.actions.ntfPool_update(selectedNtfPool))
    await this.loadPoolInfo()
  }

  async loadPoolPortal(pools) {
    const store = this.store.getState()
    let contractsRedux = this.store.getRedux('contracts')
    let web3 = store.user.web3
    const poolRedux = this.store.getRedux('pool')

    // const data = await Promise.all(pools.map(async item => {
    //   let pool = new web3.eth.Contract(WEB3.PAGE['NtfPool'].ABI, item)
    //   return await this.loadPoolInfoPortal(pool, item)
    // }))
    const data = jsonPoolDetails

    await this.dispatch(poolRedux.actions.poolsPortal_update(data))
  }

  async loadPoolInfoPortal(pool, address) {
    const methods = pool.methods
    if (!methods) {
      return
    }

    let name = await methods.name().call()
    let compRate = await methods.COMPRATE().call()
    let logo = await methods.logo().call()
    let poolNtfBalance = await methods.getPoolNtfBalance().call()
    //console.log(address, poolNtfBalance)

    return {
      name,
      compRate,
      logo,
      poolNtfBalance,
      address
    }
  }

  getName (_address) {
    const store = this.store.getState()
    //let _name = store.pool.poolNames[_address]
    // console.log('address', _address)
    // console.log('name', store.pool.poolNames[_address])
    return store.pool.poolNames[_address]
  }

  async getPools (myPoolsOnly) {
    const store = this.store.getState()
    let web3 = store.user.web3
    if (store.pool.loadingPortal) {
      return
    }
    if (store.pool.poolCount > 0) {
      return
    }
    let poolRedux = this.store.getRedux('pool')

    await this.dispatch(poolRedux.actions.loadingPortal_update(true))
    let wallet = store.user.wallet
    let methods = store.contracts.poolMaker.methods

    let poolCount = await methods.getPoolCount().call()
    console.log('loading Pools', poolCount)
    await this.dispatch(poolRedux.actions.poolCount_update(Number(poolCount)))
    //console.log('poolCount', poolCount)
    let pools = []
    let myPools = []
    let poolDetails = []
    for (let j = 0; j < 146; j++) {
      pools.push(JSON_POOLS[j])
      poolDetails.push(JSON_POOLDETAILS[j])
    }
    console.log(pools)
    await this.dispatch(poolRedux.actions.pools_update(pools))
    await this.dispatch(poolRedux.actions.poolsPortal_update(poolDetails))
    console.log(poolDetails)
    return
    let from = 0
    for (let i = from; i < 40; i++) {
      console.log('loading pool', i)
      let pool = await methods.getPool(i).call()
      let poolAddress = pool[0]
      let poolOwner = pool[1]
      let poolName = pool[2]
      let poolNtfBalance = pool[3]
      let poolGovBalance = await pool[4]
      if (((Number(poolNtfBalance) + Number(poolNtfBalance) < MIN_POOL_NTF * 1e18) && (wallet.toLowerCase() !== await poolOwner.toLowerCase()))) {
        continue
      }
      //await console.log('poolGovBalance', poolGovBalance)
      //console.log('poolName', poolName)
      if (!store.pool.poolNames[poolAddress]) {
        let _poolNames = store.pool.poolNames
        _poolNames[poolAddress] = poolName
        await this.dispatch(poolRedux.actions.poolNames_update({ _poolNames }))
      }
      if (wallet.toLowerCase() === await poolOwner.toLowerCase()) {
        // await myPools.push(poolAddress)
        // let currentMyPools = store.pool.myPools
        // currentMyPools.push(poolAddress)
        // await this.dispatch(poolRedux.actions.myPools_update(myPools))
      }
      await this.dispatch(poolRedux.actions.pools_update({ poolAddress }))
      await pools.push(poolAddress)
      let poolContract = await new web3.eth.Contract(WEB3.PAGE['NtfPool'].ABI, poolAddress)
      // let poolDetail = {
      //   name: poolName,
      //   compRate: poolCompRate,
      //   logo: poolLogo,
      //   poolNtfBalance: poolNtfBalance,
      //   address: poolAddress
      // }
      let poolDetail = await this.loadPoolInfoPortal(poolContract, poolAddress)
      poolDetails.push(poolDetail)
      if (i === 10) {
        await this.dispatch(poolRedux.actions.poolsPortal_update(poolDetails))
      }
    // await this.dispatch(poolRedux.actions.myPools_update(myPools))
    }
    // if (!myPoolsOnly) {
    //   //console.log('loading all pools')
    //   if (store.pool.selectedPool === null && pools.length > 0) {
    //     let firstPoolAddress = await pools[0]
    //     //console.log('selectedPool = ', firstPoolAddress)
    //     //await this.selectPool(firstPoolAddress)
    //   }
    // } else {
    //   //console.log('loading my pools only')
    //   if (store.pool.mySelectedPool === null && myPools.length > 0) {
    //     let firstPoolAddress = await myPools[0]
    //     //console.log('selectedPool = ', firstPoolAddress)
    //     //await this.selectMyPool(firstPoolAddress)
    //   }
    // }

    // await this.dispatch(poolRedux.actions.pools_update(pools))
    // await this.dispatch(poolRedux.actions.myPools_update(myPools))
    await this.dispatch(poolRedux.actions.poolsPortal_reset())
    await this.dispatch(poolRedux.actions.poolsPortal_update(poolDetails))
    await this.dispatch(poolRedux.actions.loadingPortal_update(false))
    console.log('loaded full')
    return await store.pool.selectedPool
  }

  getPoolCount () {
    const store = this.store.getState()
    console.log(store.pool.poolCount)
  }
  // pool's owner acctions
  async claimFund () {
    const store = this.store.getState()
    let methods = store.contracts.ntfPool.methods
    let wallet = store.user.wallet
    return await methods.fundWithdraw(wallet).send({from: wallet, gasPrice: '0'})
  }

  async joinGov (_signer) {
    const store = this.store.getState()
    let methods = store.contracts.ntfPool.methods
    let stakeRequire = 500 * 1e18
    let wallet = store.user.wallet
    return await methods.join(stakeRequire.toString(), _signer).send({from: wallet, gasPrice: '0'})
  }

  async leaveGov () {
    const store = this.store.getState()
    let methods = store.contracts.ntfPool.methods
    let wallet = store.user.wallet
    return await methods.leave().send({from: wallet})
  }

  async tokenPoolWithdraw () {
    const store = this.store.getState()
    let methods = store.contracts.ntfPool.methods
    let wallet = store.user.wallet
    return await methods.tokenPoolWithdraw().send({from: wallet, gasPrice: '0'})
  }

  async setLockDuration (_duration) {
    const store = this.store.getState()
    let methods = store.contracts.ntfPool.methods
    let wallet = store.user.wallet
    return await methods.setLockDuration(_duration).send({from: wallet, gasPrice: '0'})
  }

  async listenToDeposit () {
    var self = this
    let started = false
    setInterval(async function () {
      const store = self.store.getState()
      if ((store.user.wallet) && (store.pool.selectedPool) && (!started)) {
        started = true
        let readContract = store.contracts
        readContract.ntfToken.events.Approval({
          owner: String(store.user.wallet).toLowerCase(),
          spender: String(store.pool.selectedPool).toLowerCase()
        }, (error, data) => {
          if (!error) {
            let depositAmount = data.returnValues.value
            self.deposit(depositAmount)
          }
        })
      }
    }, 2000)
}

  // members actions
  async deposit (_amount) {
    const store = this.store.getState()
    let methods = store.contracts.ntfPool.methods
    let wallet = store.user.wallet
    const userRedux = this.store.getRedux('user')
    this.dispatch(userRedux.actions.depositing_update(false))
    return await methods.tokenDeposit(_amount.toString()).send({from: wallet, gasPrice: '0'})
  }

  async requestOut (_amount) {
    const store = this.store.getState()
    let methods = store.contracts.ntfPool.methods
    let wallet = store.user.wallet
    return await methods.requestOut(_amount.toString()).send({from: wallet, gasPrice: '0'})
  }

  async withdraw () {
    const store = this.store.getState()
    let methods = store.contracts.ntfPool.methods
    let wallet = store.user.wallet
    return await methods.tokenMemberWithdraw().send({from: wallet, gasPrice: '0'})
  }

  async claim () {
    const store = this.store.getState()
    let methods = store.contracts.ntfPool.methods
    let wallet = store.user.wallet
    return await methods.coinWithdraw().send({from: wallet, gasPrice: '0'})
  }

  async virtuellMining () {
    const store = this.store.getState()
    let methods = store.contracts.ntfPool.methods
    let wallet = store.user.wallet
    return await methods.virtuellMining().send({from: wallet, value: 3e18})
  }
  // load pool's datas

  async loadPoolInfo () {
    const store = this.store.getState()
    const poolRedux = this.store.getRedux('pool')
    let methods = store.contracts.ntfPool.methods
    let name = await methods.name().call()
    await this.dispatch(poolRedux.actions.name_update(name))
    let compRate = await methods.COMPRATE().call()
    await this.dispatch(poolRedux.actions.compRate_update(compRate))
    let website = await methods.website().call()
    await this.dispatch(poolRedux.actions.website_update(website))
    let location = await methods.location().call()
    await this.dispatch(poolRedux.actions.location_update(location))
    let logo = await methods.logo().call()
    await this.dispatch(poolRedux.actions.logo_update(logo))
    let _maxLockDuration = await methods.MAX_LOCK_DURATION().call()
    await this.dispatch(poolRedux.actions.maxLockDuration_update(_maxLockDuration))
    let _delay = await methods.OWNER_ACTION_DELAY().call()
    await this.dispatch(poolRedux.actions.ownerDelay_update(_delay))
    let _lockDuration = await methods.getLockDuration().call()
    await this.dispatch(poolRedux.actions.lockDuration_update(_lockDuration))
    let _signer = await methods.getCoinbase().call()
    await this.dispatch(poolRedux.actions.signer_update(_signer))
  }

  /*
    async loadStakeRequire () {
      const store = this.store.getState()
      console.log('contracts', store.contracts)
      let methods = store.contracts.nextyGovernance.methods
      console.log('contracts', store.contracts)
      const poolRedux = this.store.getRedux('pool')
      let _stakeRequire = await methods.stakeRequire().call()
      await this.dispatch(poolRedux.actions.stakeRequire_update(_stakeRequire))
      return await _stakeRequire
    }
  */

  // async loadMaxLockDuration () {
  //   const store = this.store.getState()
  //   let methods = store.contracts.ntfPool.methods
  //   const poolRedux = this.store.getRedux('pool')
  //   let _maxLockDuration = await methods.MAX_LOCK_DURATION().call()
  //   await this.dispatch(poolRedux.actions.maxLockDuration_update(_maxLockDuration))
  //   return await _maxLockDuration
  // }

  // async loadOwnerDelay () {
  //   const store = this.store.getState()
  //   let methods = store.contracts.ntfPool.methods
  //   const poolRedux = this.store.getRedux('pool')
  //   let _delay = await methods.OWNER_ACTION_DELAY().call()
  //   await this.dispatch(poolRedux.actions.ownerDelay_update(_delay))
  //   return await _delay
  // }

  async loadPoolOwner () {
    const store = this.store.getState()
    let methods = store.contracts.ntfPool.methods
    const poolRedux = this.store.getRedux('pool')
    let _owner = await methods.owner().call()
    await this.dispatch(poolRedux.actions.owner_update(_owner))
    return await _owner
  }

  // async loadLockDuration () {
  //   const store = this.store.getState()
  //   let methods = store.contracts.ntfPool.methods
  //   const poolRedux = this.store.getRedux('pool')
  //   let _lockDuration = await methods.getLockDuration().call()
  //   await this.dispatch(poolRedux.actions.lockDuration_update(_lockDuration))
  //   return await _lockDuration
  // }

  async loadFund () {
    const store = this.store.getState()
    let methods = store.contracts.ntfPool.methods
    const poolRedux = this.store.getRedux('pool')
    let _res = await methods.getCurFundCpt().call()
    let _fund = _res[0]
    await this.dispatch(poolRedux.actions.fund_update(_fund))
    return await _fund
  }

  async loadPoolNtfBalance () {
    const store = this.store.getState()
    let _address = store.pool.selectedPool
    let methods = store.contracts.ntfToken.methods
    const poolRedux = this.store.getRedux('pool')
    let _poolNtfBalance = await methods.balanceOf(_address).call()
    //WTF
    //console.log('aaa',_poolNtfBalance.balance)
    await this.dispatch(poolRedux.actions.poolNtfBalance_update(_poolNtfBalance))  
    return await _poolNtfBalance
  }

  async loadPoolNtyBalance () {
    const store = this.store.getState()
    let methods = store.contracts.ntfPool.methods
    const poolRedux = this.store.getRedux('pool')
    let _poolNtyBalance = await methods.getMembersBalance().call()
    await this.dispatch(poolRedux.actions.poolNtyBalance_update(_poolNtyBalance))
    return await _poolNtyBalance
  }

  async loadPoolSigner () {
    const store = this.store.getState()
    let methods = store.contracts.ntfPool.methods
    const poolRedux = this.store.getRedux('pool')
    let _signer = await methods.getCoinbase().call()
    await this.dispatch(poolRedux.actions.signer_update(_signer))
    return await _signer
  }

  async loadPoolStatus () {
    const store = this.store.getState()
    let methods = store.contracts.ntfPool.methods
    const poolRedux = this.store.getRedux('pool')
    let _status = await methods.getStatus().call()
    await this.dispatch(poolRedux.actions.status_update(_status))
    return await _status
  }

  async loadPoolDeposited () {
    const store = this.store.getState()
    let methods = store.contracts.ntfPool.methods
    const poolRedux = this.store.getRedux('pool')
    let _deposited = await methods.getPoolGovBalance().call()
    await this.dispatch(poolRedux.actions.poolDeposited_update(_deposited))
    return await _deposited
  }

  async loadPoolUnlockHeight () {
    const store = this.store.getState()
    let methods = store.contracts.ntfPool.methods
    const poolRedux = this.store.getRedux('pool')
    let _unlockHeight = await methods.getUnlockHeight().call()
    await this.dispatch(poolRedux.actions.unlockHeight_update(_unlockHeight))
    return await _unlockHeight
  }

  async loadPoolIsWithdrawable () {
    const store = this.store.getState()
    let methods = store.contracts.ntfPool.methods
    const poolRedux = this.store.getRedux('pool')
    let _isWithdrawable = await methods.isWithdrawable().call()
    await this.dispatch(poolRedux.actions.isWithdrawable_update(_isWithdrawable))
    return await _isWithdrawable
  }

  // load user's datas
  async loadMyRewardBalance () {
    let userRedux = this.store.getRedux('user')
    let store = this.store.getState()
    let methods = store.contracts.ntfPool.methods
    let wallet = store.user.wallet
    let rewardBalance = await methods.getCoinOf(wallet).call()
    await this.dispatch(userRedux.actions.rewardBalance_update(rewardBalance))
  }

  async loadMyPendingOutAmount () {
    let userRedux = this.store.getRedux('user')
    let store = this.store.getState()
    let methods = store.contracts.ntfPool.methods
    let wallet = store.user.wallet
    let pendingOut = await methods.pendingOut(wallet).call()
    await this.dispatch(userRedux.actions.myPendingOutAmount_update(pendingOut))
  }

  async loadIsLocking () {
    let userRedux = this.store.getRedux('user')
    let store = this.store.getState()
    let methods = store.contracts.ntfPool.methods
    let wallet = store.user.wallet
    let locked = await methods.isLocking(wallet).call()
    await this.dispatch(userRedux.actions.isLocking_update(locked))
  }

  async loadUnlockTime () {
    let userRedux = this.store.getRedux('user')
    let store = this.store.getState()
    let methods = store.contracts.ntfPool.methods
    let wallet = store.user.wallet
    let unlockTime = await methods.getUnlockTime(wallet).call()
    await this.dispatch(userRedux.actions.unlockTime_update(unlockTime))
  }

  async loadMyDepositedNtf () {
    let userRedux = this.store.getRedux('user')
    let store = this.store.getState()
    let methods = store.contracts.ntfPool.methods
    let wallet = store.user.wallet
    let deposited = await methods.balanceOf(wallet).call()
    await this.dispatch(userRedux.actions.ntfDeposited_update(deposited))
  }

  // read functions
}
