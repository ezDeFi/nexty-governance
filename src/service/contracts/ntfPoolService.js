import BaseService from '../../model/BaseService'
import Web3 from 'web3'
import axios from 'axios'
import _ from 'lodash' // eslint-disable-line
import { WEB3, CONTRACTS, MIN_POOL_NTF, JSON_POOLS, JSON_POOLDETAILS } from '@/constant'
import { stringify } from 'postcss'
import { api_request } from '@/util'
import stores from '@/store'

export default class extends BaseService {
  async putData () {
    let web3 = new Web3(new Web3.providers.HttpProvider(WEB3.HTTP))
    const userRedux = this.store.getRedux('user')
    const contractsRedux = stores.getRedux('contracts')
    const contracts = {
      // NextyManager: new web3.eth.Contract(WEB3.PAGE['NextyManager'].ABI, WEB3.PAGE['NextyManager'].ADDRESS),
      // NtfToken: new web3.eth.Contract(WEB3.PAGE['NTFToken'].ABI, WEB3.PAGE['NTFToken'].ADDRESS),
      // NtfPool: new web3.eth.Contract(WEB3.PAGE['NtfPool'].ABI, WEB3.PAGE['NTFToken'].ADDRESS),
      PoolMaker: new web3.eth.Contract(WEB3.PAGE['PoolMaker'].ABI, WEB3.PAGE['PoolMaker'].ADDRESS)
    }
    // await store.dispatch(userRedux.actions.loginMetamask_update(true))
    // await stores.dispatch(userRedux.actions.contract_update(contracts))
    // await stores.dispatch(contractsRedux.actions.ntfToken_update(contracts.NtfToken))
    // await stores.dispatch(contractsRedux.actions.ntfPool_update(contracts.NtfPool))
    // await stores.dispatch(contractsRedux.actions.poolMaker_update(contracts.PoolMaker))
    // await stores.dispatch(userRedux.actions.web3_update(web3))
  }

  async getPortal () {
    const poolRedux = this.store.getRedux('pool')
    const result = await api_request({
      path: '/api/pool/get_portal',
      method: 'get'
    })
    await this.dispatch(poolRedux.actions.poolsPortal_update(result))
    await this.dispatch(poolRedux.actions.loadedTo_update(result.length))
  }

  async createPool (owner, compRate, maxLock, delay, name, website, location, logo) {
    console.log(owner, compRate, maxLock, delay, name, website, location, logo)
    console.log(typeof(owner), typeof(compRate), typeof(maxLock), typeof(delay), typeof(name), typeof(website), typeof(location), typeof(logo))
    const store = this.store.getState()
    console.log('contract', store.contracts)
    let methods = store.contracts.poolMaker.methods
    let wallet = store.user.wallet
    console.log('wallet', wallet)
    let res = await methods.createPool(owner, compRate, maxLock, delay, name, website, location, logo).send({ from: wallet, gasPrice: '0' })
    console.log('resssssssssssssss',res)
  }

  async loadMyCurrentPool () {
    const store = this.store.getState()
    console.log('my current Pool', store.pool.mySelectedPool)
    await this.selectPool(store.pool.mySelectedPool)
    this.loadFund()
    this.loadPoolNtfBalance()
    this.loadPoolNtyBalance()

    this.loadPoolIsWithdrawable()
    this.loadPoolUnlockHeight()
    this.loadPoolDeposited()
    this.loadPoolInfo()
    this.loadPoolSigner()
  }

  async selectMyPool (_address) {
    let poolRedux = this.store.getRedux('pool')
    await this.dispatch(poolRedux.actions.mySelectedPool_update(_address))
    await this.dispatch(poolRedux.actions.selectedPool_update(_address))
    this.loadMyCurrentPool()
  }

  async selectPool (_address) {
    let poolRedux = this.store.getRedux('pool')
    await this.dispatch(poolRedux.actions.selectedPool_update(_address))
    this.loadPool(_address)
  }

  // async loadPool (_address) {
  //   const store = this.store.getState()
  //   let contractsRedux = this.store.getRedux('contracts')
  //   let web3 = store.user.web3
  //   let selectedNtfPool = new web3.eth.Contract(CONTRACTS.NtfPool.abi, _address)
  //   await this.dispatch(contractsRedux.actions.ntfPool_update(selectedNtfPool))
  //   await this.loadPoolInfo()
  // }
  async loadPool (_address) {
    const store = this.store.getState()
    let contractsRedux = this.store.getRedux('contracts')
    let web3 = store.user.web3
    if (!web3) return
    let selectedNtfPool = new web3.eth.Contract(WEB3.PAGE['NtfPool'].ABI, _address)
    await this.dispatch(contractsRedux.actions.ntfPool_update(selectedNtfPool))
    await this.loadPoolInfo()
  }

  async loadCurrentPool () {
    await this.resetPool()
    const store = this.store.getState()
    console.log('Load current pool', store.pool)
    let _address = store.pool.selectedPool
    let contractsRedux = this.store.getRedux('contracts')
    let web3 = store.user.web3
    if (!web3) return
    let selectedNtfPool = new web3.eth.Contract(WEB3.PAGE['NtfPool'].ABI, _address)
    // let selectedNtfPool = new web3.eth.Contract(CONTRACTS.NtfPool.abi, _address)
    await this.dispatch(contractsRedux.actions.ntfPool_update(selectedNtfPool))
    await this.loadPoolInfo()
  }

  async loadPoolPortal (pools) {
    //await this.getPortal()
    return
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

  async loadPoolInfoPortal (pool, address) {
    const methods = pool.methods
    if (!methods) {
      return
    }
    let name = await methods.name().call()
    let compRate = await methods.COMPRATE().call()
    let logo = await methods.logo().call()
    let deposited = await methods.getPoolGovBalance().call()
    let poolNtfBalance = await methods.getPoolNtfBalance().call()
    poolNtfBalance = Number(poolNtfBalance) + Number(deposited)
    let status = await methods.getStatus().call()
    let updated = true
    // console.log(address, poolNtfBalance)
    return {
      name,
      compRate,
      logo,
      poolNtfBalance,
      address,
      status,
      updated
    }
  }

  getName (_address) {
    const store = this.store.getState()
    //let _name = store.pool.poolNames[_address]
    // console.log('address', _address)
    // console.log('name', store.pool.poolNames[_address])
    return store.pool.poolNames[_address]
  }

  async loadPoolPortalDetails () {
    await this.getPortal()
    return
    const store = this.store.getState()
    let poolRedux = this.store.getRedux('pool')

    let web3 = store.user.web3
    let poolsPortal = store.pool.poolsPortal
    let poolCount = store.pool.poolCount
    for (let i = 0; i < poolCount; i++) {
      // console.log(i, poolsPortal[i])
      let poolAddress = poolsPortal[i].address
      let poolContract = await new web3.eth.Contract(WEB3.PAGE['NtfPool'].ABI, poolAddress)
      let poolDetail = await this.loadPoolInfoPortal(poolContract, poolAddress)
      poolsPortal[i] = poolDetail
      // console.log('xxx',  poolsPortal[i] )
      await this.dispatch(poolRedux.actions.poolsPortal_update(poolsPortal))
      await this.dispatch(poolRedux.actions.loadedTo_update(i + 1))
    }
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
    // console.log('loading Pools', poolCount)
    await this.dispatch(poolRedux.actions.poolCount_update(Number(poolCount)))
    // console.log('poolCount', poolCount)
    let pools = JSON_POOLS
    let myPools = []
    let poolDetails = JSON_POOLDETAILS
    this.loadPoolPortalDetails()

    this.dispatch(poolRedux.actions.pools_update(pools))
    this.dispatch(poolRedux.actions.poolsPortal_update(poolDetails))
    let i = 146
    while (i < poolCount) {
      // console.log('loading pool', i)
      let pool = await methods.getPool(i).call()
      let poolAddress = pool[0]
      let poolOwner = pool[1]
      let poolName = pool[2]
      let poolNtfBalance = pool[3]
      let poolGovBalance = await pool[4]
      if (((Number(poolNtfBalance) + Number(poolNtfBalance) < MIN_POOL_NTF * 1e18) && (wallet.toLowerCase() !== await poolOwner.toLowerCase()))) {
        continue
      }
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
      // let poolDetail = await this.loadPoolInfoPortal(poolContract, poolAddress)
      poolDetails.push({ name: poolName, address: poolAddress })
      // if (i === 10) {
      //   await this.dispatch(poolRedux.actions.poolsPortal_update(poolDetails))
      // }
      i++
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

    await this.dispatch(poolRedux.actions.pools_update(pools))
    await this.dispatch(poolRedux.actions.poolsPortal_update(poolDetails))
    await this.dispatch(poolRedux.actions.loadingPortal_update(false))
    this.loadPoolPortalDetails() //Temporarily fix for blank result
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
    return await methods.fundWithdraw(wallet).send({from: wallet})
  }

  async joinGov (_signer) {
    const store = this.store.getState()
    let methods = store.contracts.ntfPool.methods
    let stakeRequire = '50000000000000000000000'
    let wallet = store.user.wallet
    return await methods.join(stakeRequire, _signer).send({from: wallet})
  }

  async leaveGov () {
    const store = this.store.getState()
    let methods = store.contracts.ntfPool.methods
    let wallet = store.user.wallet
    return await methods.leave().send({ from: wallet })
  }

  async tokenPoolWithdraw () {
    const store = this.store.getState()
    let methods = store.contracts.ntfPool.methods
    let wallet = store.user.wallet
    return await methods.tokenPoolWithdraw().send({ from: wallet, gasPrice: '0' })
  }

  async setLockDuration (_duration) {
    const store = this.store.getState()
    let methods = store.contracts.ntfPool.methods
    let wallet = store.user.wallet
    let owner = await methods.owner().call()
    return await methods.setLockDuration(_duration).send({from: wallet})
  }

  // members actions
  async listenToDeposit () {
    var self = this
    let started = false
    let depositListening = setInterval(async function () {
      const store = self.store.getState()
      if ((store.user.wallet) && (store.pool.selectedPool) && (!started)) {
        started = true
        let readContract = store.contracts
        console.log(store.pool.selectedPool, store.user.wallet)
        readContract.ntfToken.events.Approval({
          owner: String(store.user.wallet).toLowerCase(),
          spender: String(store.pool.selectedPool).toLowerCase()
        }, (error, data) => {
          if (!error) {
            let depositAmount = data.returnValues.value
            clearInterval(depositListening)
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
    return await methods.tokenDeposit(_amount.toString()).send({ from: wallet, gasPrice: '0' })
  }

  async requestOut (_amount) {
    const store = this.store.getState()
    let methods = store.contracts.ntfPool.methods
    let wallet = store.user.wallet
    return await methods.requestOut(_amount.toString()).send({ from: wallet, gasPrice: '0' })
  }

  async withdraw () {
    const store = this.store.getState()
    let methods = store.contracts.ntfPool.methods
    let wallet = store.user.wallet
    return await methods.tokenMemberWithdraw().send({ from: wallet, gasPrice: '0' })
  }

  async claim () {
    const store = this.store.getState()
    let methods = store.contracts.ntfPool.methods
    let wallet = store.user.wallet
    return await methods.coinWithdraw().send({from: wallet})
  }

  async virtuellMining () {
    const store = this.store.getState()
    let methods = store.contracts.ntfPool.methods
    let wallet = store.user.wallet
    return await methods.virtuellMining().send({from: wallet, value: 3e18})
  }
  // load pool's datas

  async loadPoolInfo () {
    console.log('load pool info')
    const store = this.store.getState()
    const poolRedux = this.store.getRedux('pool')
    let methods = store.contracts.ntfPool.methods
    console.log('methods',methods)
    let name = methods.name().call()
    let compRate = methods.COMPRATE().call()
    let website = methods.website().call()
    let location = methods.location().call()
    let logo = methods.logo().call()
    let _maxLockDuration = methods.MAX_LOCK_DURATION().call()
    let _delay = methods.OWNER_ACTION_DELAY().call()
    let _lockDuration = methods.getLockDuration().call()
    let _signer = methods.getCoinbase().call()
    let owner = await methods.owner().call()
    this.dispatch(poolRedux.actions.owner_update(owner))
    this.dispatch(poolRedux.actions.name_update(await name))
    this.dispatch(poolRedux.actions.compRate_update(await compRate))
    this.dispatch(poolRedux.actions.website_update(await website))
    this.dispatch(poolRedux.actions.location_update(await location))
    this.dispatch(poolRedux.actions.logo_update(await logo))
    this.dispatch(poolRedux.actions.maxLockDuration_update(await _maxLockDuration))
    this.dispatch(poolRedux.actions.ownerDelay_update(await _delay))
    this.dispatch(poolRedux.actions.lockDuration_update(await _lockDuration))
    this.dispatch(poolRedux.actions.signer_update(await _signer))
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

  async loadPoolDeposited () {
    const store = this.store.getState()
    let methods = store.contracts.ntfPool.methods
    const poolRedux = this.store.getRedux('pool')
    let _deposited = await methods.getPoolGovBalance().call()
    await this.dispatch(poolRedux.actions.poolDeposited_update(_deposited))
    console.log(_deposited)
    return await _deposited
  }

  async loadPoolNtfBalance () {
    const store = this.store.getState()
    //let _address = CONTRACTS.NtfPool.address
    let _address = store.pool.selectedPool
    console.log('NTF',store.pool.selectedPool)
    let methods = store.contracts.ntfToken.methods
    const poolRedux = this.store.getRedux('pool')
    let _poolNtfBalance = await methods.balanceOf(_address).call()
    await this.dispatch(poolRedux.actions.poolNtfBalance_update(_poolNtfBalance.balance))
    return await _poolNtfBalance
    // let dat = await this.store.getState().contracts.ntfToken.methods.balanceOf(store.pool.selectedPool).call()
    // console.log('adadad',dat,this.store.getState())
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

  async getLeakedSigners () {
    let _leaked_signers = []
    await axios.post(WEB3.HTTP, { 'jsonrpc': '2.0', 'method': 'dccs_queue', 'params': ['leaked'], 'id': 1 })
      .then(function (response) {
        _leaked_signers = response.data.result
      })
      .catch(function (error) {
        console.log(error)
      })
    return _leaked_signers
  }

  async loadPoolStatus () {
    console.log('Load pool status')
    const store = this.store.getState()
    let methods = store.contracts.ntfPool.methods
    const poolRedux = this.store.getRedux('pool')
    let _status = await methods.getStatus().call()
    let _signer = await methods.getCoinbase().call()
    let _leaked_signers = await this.getLeakedSigners()
    let found = _leaked_signers.find(key => key.toUpperCase() === _signer.toUpperCase()) != undefined
    if (found) _status = 'leaked'
    // web3.currentProvider.connection._url
    await this.dispatch(poolRedux.actions.status_update(_status))
    return await _status
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

  async resetPool () {
    let pool = {
      name: null,
      compRate: null,
      website: null,
      location: null,
      logo: null,
      poolNames: [],
      myPools: [],
      pools: [],
      poolCount: 0,
      selectedPool: null,
      mySelectedPool: null,
      poolNtyBalance: 0,
      poolNtfBalance: 0,
      poolGovBalance: 0,
      lockDuration: 0,
      maxLockDuration: 0,
      ownerDelay: 0,
      fund: 0,
      owner: null,
      ownerBalance: 0,
      signer: null,
      status: null,
      isWithdrawable: false,
      unlockHeight: 0,
      poolDeposited: 0,
      stakeRequire: 500 * 1e18,
      poolsPortal: [],
      loadingPortal: false
    }
    let poolRedux = this.store.getRedux('pool')
    this.dispatch(poolRedux.actions.name_update(pool.name))
    this.dispatch(poolRedux.actions.compRate_update(pool.compRate))
    this.dispatch(poolRedux.actions.website_update(pool.website))
    this.dispatch(poolRedux.actions.location_update(pool.location))
    this.dispatch(poolRedux.actions.logo_update(pool.logo))

    this.dispatch(poolRedux.actions.poolNtyBalance_update(pool.poolNtyBalance))
    this.dispatch(poolRedux.actions.poolNtfBalance_update(pool.poolNtfBalance))
    this.dispatch(poolRedux.actions.poolGovBalance_update(pool.poolGovBalance))
    this.dispatch(poolRedux.actions.lockDuration_update(pool.lockDuration))

    this.dispatch(poolRedux.actions.maxLockDuration_update(pool.maxLockDuration))
    this.dispatch(poolRedux.actions.ownerDelay_update(pool.ownerDelay))
    this.dispatch(poolRedux.actions.fund_update(pool.fund))
    this.dispatch(poolRedux.actions.owner_update(pool.owner))

    this.dispatch(poolRedux.actions.ownerBalance_update(pool.ownerBalance))
    this.dispatch(poolRedux.actions.signer_update(pool.signer))
    this.dispatch(poolRedux.actions.isWithdrawable_update(pool.isWithdrawable))
    this.dispatch(poolRedux.actions.unlockHeight_update(pool.unlockHeight))

    this.dispatch(poolRedux.actions.poolDeposited_update(pool.poolDeposited))
    this.dispatch(poolRedux.actions.stakeRequire_update(pool.stakeRequire))
    this.dispatch(poolRedux.actions.isWithdrawable_update(pool.isWithdrawable))
    this.dispatch(poolRedux.actions.unlockHeight_update(pool.unlockHeight))
  }

  // read functions
}
