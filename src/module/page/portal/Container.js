import { createContainer } from '@/util'
import Component from './Component'
// import NTFToken from '@/service/NTFToken'
import NtfTokenService from '@/service/contracts/ntfTokenService'
import NtfPoolService from '@/service/contracts/ntfPoolService'
import UserService from '@/service/UserService'
import axios from 'axios'
import Web3 from 'web3'
import ntfTokenABI from '../../../../deployed/NtfTokenABI.json'
import ntfPoolABI from '../../../../deployed/NtfPoolABI.json'
import poolMakerABI from '../../../../deployed/PoolMaker.json'

var curWallet = null
const web3 = new Web3(new Web3.providers.WebsocketProvider('wss://ws.nexty.io'))

const ntfATokenAddress = '0x2c783ad80ff980ec75468477e3dd9f86123ecbda'
const poolMakerAddress = '0xdF4408e79bF48ca4dFA78CC62Ecc6F662f6c714F'

const ntfToken = new web3.eth.Contract(ntfTokenABI, ntfATokenAddress)
const poolMaker = new web3.eth.Contract(poolMakerABI, poolMakerAddress)
// const govAddress = '0x0000000000000000000000000000000000012345'

let leaked_signers = []

getPool()

async function getPoolCount() {
  const poolCount = await poolMaker.methods.getPoolCount().call().catch()
  return await poolCount
}

async function getPool() {
  let poolCount = await getPoolCount()
  let array = []
  for(let i = 0; i < poolCount; i++) {
    array.push(i)
  }
  if (array.length == poolCount) {
    array.forEach(function (element) {
      poolMaker.methods.pools(element).call().then(result=>{
        getpooldetail(result)
      })
    })
  }
}

async function getpooldetail(address) {
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
  console.log(details)
  // console.log('aa',this.leaked_signers)
}

async function loadLeaked() {
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

async function getCurrentBlockNumber () {
  const blockNumber = await web3.eth.getBlockNumber().catch()
  return Number(blockNumber)
}

export default createContainer(Component, (state) => {
  const userService = new UserService()
  const ntfTokenService = new NtfTokenService()
  const ntfPoolService = new NtfPoolService()
  async function load () {
    ntfPoolService.getPools(false)
  }
  if (state.user.wallet !== curWallet && !curWallet) {
    curWallet = state.user.wallet
    load()
    // setInterval(() => {
    //   load()
    // }, 5000)
  }

  return {
    loadedTo: state.pool.loadedTo,
    pools: state.pool.pools,
    poolsPortal: state.pool.poolsPortal,
    loadingPortal: state.pool.loadingPortal,
    myPendingOutAmount: state.user.myPendingOutAmount,
  }
}, () => {
  const userService = new UserService()
  const ntfTokenService = new NtfTokenService()
  const ntfPoolService = new NtfPoolService()

  return {
    getName (_address) {
      return ntfPoolService.getName(_address)
    },
    async loadPoolPortal (pools) {
      // return await ntfPoolService.loadPoolPortal(pools)
    }
  }
})
