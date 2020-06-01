import Web3 from 'web3'

const web3 = new Web3(new Web3.providers.WebsocketProvider('wss://ws.nexty.io'))
// let web3 = new Web3(new Web3.providers.HttpProvider('https://rpc.nexty.io'))

import ntfTokenABI from '../../../../deployed/NtfTokenABI.json'
import ntfpoolABI from '../../../../deployed/NtfPoolABI.json'
import poolMakerABI from '../../../../deployed/PoolMaker.json'

// import ntfToken from '../../../../deployed/NtfToken.json'


const ntfATokenAddress = '0x2c783ad80ff980ec75468477e3dd9f86123ecbda'
const poolMakerAddress = '0xdF4408e79bF48ca4dFA78CC62Ecc6F662f6c714F'

// const ntfPoolAbi = require(PATH + 'pool/NtfPool.json')

const ntfToken = new web3.eth.Contract(ntfTokenABI, ntfATokenAddress)
const poolMaker = new web3.eth.Contract(poolMakerABI, poolMakerAddress)

// const govAbi = require(PATH + 'NextyGovernance.json')
// const govAddress = '0x0000000000000000000000000000000000012345'

// const poolMakerAbi = require(PATH + 'pool/PoolMaker.json')
// const poolMakerAddress = '0xdF4408e79bF48ca4dFA78CC62Ecc6F662f6c714F'

getPool()
async function getPoolCount() {
  const poolCount = await poolMaker.methods.getPoolCount().call().catch()
  return await poolCount
}

async function getPool() {
  let poolCount = await getPoolCount()
  for (let i = 0; i < poolCount; i++) {
    let poolAddress = await poolMaker.methods.pools(i).call().catch()
    console.log('addressssss',poolAddress)
  }
}

async function getCurrentBlockNumber () {
  const blockNumber = await web3.eth.getBlockNumber().catch()
  return Number(blockNumber)
}

