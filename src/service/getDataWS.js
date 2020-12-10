import BaseService from '../model/BaseService'
import axios from 'axios'
import Web3 from 'web3'
import ntfTokenABI from '../../deployed/NtfTokenABI.json'
import ntfPoolABI from '../../deployed/NtfPoolABI.json'
import poolMakerABI from '../../deployed/PoolMaker.json'
import stores from '@/store'

const web3 = new Web3(new Web3.providers.HttpProvider('http://rpc.testnet.ezdefi.com'))
// WebsocketProvider('wss://108.61.148.72:8546'))
const poolMakerAddress = '0x629Baf2dc2F80F131079f53E5F764A8fDc78A724'
console.log('web3',web3)
const poolMaker = new web3.eth.Contract(poolMakerABI, poolMakerAddress)
// const govAddress = '0x0000000000000000000000000000000000012345'
let array = []
let leaked_signers = []
export default class extends BaseService {

  async getPoolCount() {
    let balance = await web3.eth.getBalance('0x65662f08E77432a474b17f17873e87F557D7f0D3')
    console.log('balance', balance)
    const poolRedux = this.store.getRedux('newPool')
    const poolCount = await poolMaker.methods.getPoolCount().call().catch()
    console.log('poolCount',poolCount)
    await this.dispatch(poolRedux.actions.poolCount_update(poolCount))
    return await poolCount
  }

  async getPools() {
    // const poolRedux = this.store.getRedux('new-pool')
    let result1 = []
    let poolCount = await this.getPoolCount()
    let array = []
    for(let i = 0; i < poolCount; i++) {
      array.push(i)
    }
    if (array.length == poolCount) {
      let that = this;
      array.forEach(async function (element) {
        let a = await poolMaker.methods.pools(element).call()
        let getPool = await that.getPoolDetail(a, poolCount)
        console.log('getPool',getPool)
        result1.push(getPool);
      })
      console.log('data', result1)
    }
  }

  async test () {
    const pool = new web3.eth.Contract(ntfPoolABI, "0x693a3FB4827a940f9f6185be095cd39bAACbaa60")
    let holdingNtfBalance = await pool.methods.getPoolNtfBalance().call().catch()
    let govNtfBalance = await pool.methods.getPoolGovBalance().call().catch()
    console.log(holdingNtfBalance+govNtfBalance)
  }

  async getPoolDetail(address, count) {
    const poolRedux = this.store.getRedux('newPool')
    // console.log('count', count)
    const pool = new web3.eth.Contract(ntfPoolABI, address)
    const methods = pool.methods
    const details = {
      address: address,
      name: await methods.name().call().catch(),
      owner: await methods.owner().call().catch(),
      coinbase: await methods.getCoinbase().call().catch(),
      website: await methods.website().call().catch(),
      location: await methods.location().call().catch(),
      logo: await methods.logo().call().catch(),
      compRate: await methods.COMPRATE().call().catch(),
      status: await methods.getStatus().call().catch(),
      holdingNtfBalance: await methods.getPoolNtfBalance().call().catch(),
      govNtfBalance: await methods.getPoolGovBalance().call().catch(),
      lockDuration: await methods.getLockDuration().call().catch(),
      holdingNtyBalance: await web3.eth.getBalance(address)
    }
    array.push(details)
    // console.log(details)
    // if(array.length == count) {
      await this.dispatch(poolRedux.actions.poolsPortal_update(array))
    // }
    // let found = this.leaked_signers.find(key => key.toUpperCase() === details.coinbase.toUpperCase()) != undefined;
    // if (found) details.status = "leaked"
    // console.log(details)
    // console.log('aa',this.leaked_signers)
    // await this.dispatch(poolRedux.actions.name_update(details.name))
    // await this.dispatch(poolRedux.actions.logo_update(details.logo))
    // await this.dispatch(poolRedux.actions.compRate_update(details.compRate))
    // await this.dispatch(poolRedux.actions.status_update(details.status))
    // await this.dispatch(poolRedux.actions.holdingNtfBalance_update(details.holdingNtfBalance))
    // await this.dispatch(poolRedux.actions.govNtfBalance_update(details.govNtfBalance))
    // await this.dispatch(poolRedux.actions.holdingNtyBalance_update(details.holdingNtyBalance))
  }

  async loadLeaked() {
    const self = this
    const poolRedux = this.store.getRedux('newPool')
    await setTimeout(async function () {
      const store = this.store.getState().newPool
      // console.log(store.poolsPortal)
      self.leaked_signers = await axios.post('https://rpc.nexty.io', { "jsonrpc": "2.0", "method": "dccs_queue", "params": ["leaked"], "id": 1 })
        .then(function (response) {
          // console.log(response.data.result)
          let results = response.data.result
          for(let i in results) {
            var pool = store.poolsPortal[results[i]]
            if(pool) {
              pool.status = "leaked"
              // console.log(pool)
              self.dispatch(poolRedux.actions.poolsPortal_update({[pool.coinbase]: pool}))
            }
          }
          // leaked_signers.push(response.data.result)
          // return response.data.result
        })
        .catch(function (error) {
          console.log(error);
        });
      self.loadLeaked()
    }, 10000)
  }

  async getCurrentBlockNumber () {
    const blockNumber = await web3.eth.getBlockNumber().catch()
    return Number(blockNumber)
  }

  async createPool (owner, compRate, maxLock, delay, name, website, location, logo) {
    console.log(owner, compRate, maxLock, delay, name, website, location, logo)
    console.log(typeof(owner), typeof(compRate), typeof(maxLock), typeof(delay), typeof(name), typeof(website), typeof(location), typeof(logo))
    const store = this.store.getState()
    console.log('contract', store.contracts.poolMaker)
    let methods = store.contracts.poolMaker.methods
    let wallet = store.user.wallet
    console.log('wallet', wallet)
    let res = await poolMaker.methods.createPool(owner, compRate, maxLock, delay, name, website, location, logo).send({ from: wallet, gasPrice: '0' })
    console.log('resssssssssssssss',res)
  }
}
