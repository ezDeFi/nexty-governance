import BaseService from '../model/BaseService'
import axios from 'axios'
import Web3 from 'web3'
import ntfTokenABI from '../../deployed/NtfTokenABI.json'
import ntfPoolABI from '../../deployed/NtfPoolABI.json'
import poolMakerABI from '../../deployed/PoolMaker.json'

const web3 = new Web3(new Web3.providers.WebsocketProvider('wss://ws.nexty.io'))

const ntfATokenAddress = '0x2c783ad80ff980ec75468477e3dd9f86123ecbda'
const poolMakerAddress = '0xdF4408e79bF48ca4dFA78CC62Ecc6F662f6c714F'

const ntfToken = new web3.eth.Contract(ntfTokenABI, ntfATokenAddress)
const poolMaker = new web3.eth.Contract(poolMakerABI, poolMakerAddress)
// const govAddress = '0x0000000000000000000000000000000000012345'

let leaked_signers = []
export default class extends BaseService {

  async getPoolCount() {
    const poolRedux = this.store.getRedux('newPool')
    const poolCount = await poolMaker.methods.getPoolCount().call().catch()
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
      await array.forEach(async function (element) {
        let a = await poolMaker.methods.pools(element).call()
        let getPool = await that.getpooldetail(a)
        result1.push(getPool);
      })
    }
  }

  async getpooldetail(address) {
    const poolRedux = this.store.getRedux('newPool')
    // console.log(address)
    const pool = new web3.eth.Contract(ntfPoolABI, address)
    const methods = pool.methods
    const details = {
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
    // let found = this.leaked_signers.find(key => key.toUpperCase() === details.coinbase.toUpperCase()) != undefined;
    // if (found) details.status = "leaked"
    // console.log(details)
    // console.log('aa',this.leaked_signers)
    await this.dispatch(poolRedux.actions.name_update(details.name))
    await this.dispatch(poolRedux.actions.owner_update(details.owner))
    await this.dispatch(poolRedux.actions.logo_update(details.logo))
    await this.dispatch(poolRedux.actions.compRate_update(details.compRate))
    await this.dispatch(poolRedux.actions.status_update(details.status))
    await this.dispatch(poolRedux.actions.holdingNtfBalance_update(details.holdingNtfBalance))
    await this.dispatch(poolRedux.actions.govNtfBalance_update(details.govNtfBalance))
    await this.dispatch(poolRedux.actions.holdingNtyBalance_update(details.holdingNtyBalance))
  }

  async loadLeaked() {
    const self = this
    await setTimeout(async function () {
      self.leaked_signers = await axios.post(self.endpoint, { "jsonrpc": "2.0", "method": "dccs_queue", "params": ["leaked"], "id": 1 })
        .then(function (response) {
          return response.data.result
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
  
}