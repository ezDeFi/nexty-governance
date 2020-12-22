import BaseService from '../model/BaseService'
import axios from 'axios'
import Web3 from 'web3'
import ntfTokenABI from '../../deployed/NtfTokenABI.json'
import ntfPoolABI from '../../deployed/NtfPoolABI.json'
import poolMakerABI from '../../deployed/PoolMaker.json'
import { WEB3 } from '@/constant'

// const web3 = new Web3(new Web3.providers.HttpProvider('http://rpc.testnet.ezdefi.com'))
// WebsocketProvider('wss://108.61.148.72:8546'))
let web3 = new Web3(window.ethereum)
const poolMakerAddress = '0x629Baf2dc2F80F131079f53E5F764A8fDc78A724'

const poolMaker = new web3.eth.Contract(poolMakerABI, poolMakerAddress)
// const govAddress = '0x0000000000000000000000000000000000012345'
let array = []
let leaked_signers = []
export default class extends BaseService {

  async getPoolCount() {
    const poolRedux = this.store.getRedux('newPool')
    const poolCount = await poolMaker.methods.getPoolCount().call().catch()
    // console.log('poolCount',poolCount)
    await this.dispatch(poolRedux.actions.poolCount_update(poolCount))
    return await poolCount
  }

  async getPools() {
    // const poolRedux = this.store.getRedux('new-pool')
    let poolCount = await this.getPoolCount()
    let array = []
    for(let i = 0; i < poolCount; i++) {
      array.push(i)
    }
    if (array.length == poolCount) {
      let that = this;
      array.forEach(async function (element) {
        let a = await poolMaker.methods.pools(element).call()
        await that.getPoolDetail(a, poolCount)
      })
    }
  }

  async getPoolDetail(address, count) {
    const poolRedux = this.store.getRedux('newPool')
    let contractsRedux = this.store.getRedux('contracts')
    // console.log('count', count)
    const pool = new web3.eth.Contract(ntfPoolABI, address)
    await this.dispatch(contractsRedux.actions.ntfPool_update(pool))
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
    setTimeout(async function () {
      const store = this.store.getState().newPool
      // console.log(store.poolsPortal)
      self.leaked_signers = await axios.post(WEB3.HTTP, { "jsonrpc": "2.0", "method": "dccs_queue", "params": ["leaked"], "id": 1 })
        .then(function (response) {
          let results = response.data.result
          for(let i in results) {
            var pool = store.poolsPortal[results[i]]
            if(pool) {
              pool.status = "leaked"
              // console.log(pool)
              self.dispatch(poolRedux.actions.poolsPortal_update(pool))
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

  async getZDBalance () {
    const userRedux = this.store.getRedux('user')
    let wallet = await window.ethereum.selectedAddress
    await this.dispatch(userRedux.actions.wallet_update(wallet))
    let balance = await web3.eth.getBalance(wallet)
    console.log('balance', balance)
    await this.dispatch(userRedux.actions.ntfBalance_update(balance))
  }

  async getWallet () {
    const userRedux = this.store.getRedux('user')
    let wallet = await window.ethereum.selectedAddress
    await this.dispatch(userRedux.actions.wallet_update(wallet))
  }

  async getCurrentBlockNumber () {
    const blockNumber = await web3.eth.getBlockNumber().catch()
    return Number(blockNumber)
  }
}
