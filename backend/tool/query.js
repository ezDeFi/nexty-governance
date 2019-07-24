const Web3 = require('web3')
const endPoint = 'https://rpc.nexty.io'
const web3 = new Web3(endPoint)
const PATH = '../deployed/'

const ntfAbi = require(PATH + 'NtfToken.json')
const ntfAddress = '0x2c783ad80ff980ec75468477e3dd9f86123ecbda'

const ntfPoolAbi = require(PATH + 'pool/NtfPool.json')

const govAbi = require(PATH + 'NextyGovernance.json')
const govAddress = '0x0000000000000000000000000000000000012345'

const poolMakerAbi = require(PATH + 'pool/PoolMaker.json')
const poolMakerAddress = '0xd4e5390c22782841B28F65A3B8F0cbd82f2b775E'

const CONTRACTS_DATA = {
  ntfToken: {
    abi: ntfAbi.abi,
    address: ntfAddress
  },
  gov: {
    abi: govAbi.abi,
    address: govAddress
  },
  poolMaker: {
    abi: poolMakerAbi.abi,
    address: poolMakerAddress
  },
}

const contracts = {
  ntfToken: new web3.eth.Contract(CONTRACTS_DATA.ntfToken.abi, CONTRACTS_DATA.ntfToken.address),
  gov: new web3.eth.Contract(CONTRACTS_DATA.gov.abi, CONTRACTS_DATA.gov.address),
  poolMaker: new web3.eth.Contract(CONTRACTS_DATA.poolMaker.abi, CONTRACTS_DATA.poolMaker.address)
}

async function getPoolCount () {
  const poolCount = await contracts.poolMaker.methods.getPoolCount().call()
  return await poolCount
}

async function loadPool (address) {
  const pool = new web3.eth.Contract(ntfPoolAbi.abi, address)
  const methods = pool.methods
  const details = {
    address: address,
    name: await methods.name().call(),
    owner: await methods.owner().call(),
    website: await methods.website().call(),
    location: await methods.location().call(),
    logo: await methods.logo().call(),
    compRate: await methods.COMPRATE().call(),
    status: await methods.getStatus().call(),
    holdingNtfBalance: await methods.getPoolNtfBalance().call(),
    govNtfBalance: await methods.getPoolGovBalance().call(),
    holdingNtyBalance: await web3.eth.getBalance(address)
  }
  console.log(details)
  return details
}

async function loadPools (from) {
  const poolCount = await getPoolCount()
  let res = []
  for (let i = from; i < poolCount; i++) {
    let poolAddress = await contracts.poolMaker.methods.pools(i).call()
    const details = await loadPool(poolAddress)
    res.push(details)
  }
  return res
}

async function start () {
  await loadPools(0)
}

start()

/*
    address: {type: String, toLowercase: true},
    name: {type: String},
    owner: {type: String, toLowercase: true},
    website: {type: String},
    location: {type: String},
    logo: {type: String},
    compRate: {type: Number},
    status: {type: String},
    holdingNtfBalance: {type: Number, default: 0},
    holdingNtyBalance: {type: Number, default: 0},
*/