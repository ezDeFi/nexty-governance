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

async function loadPools (from) {
  const poolCount = await getPoolCount()
  let res = []
  for (let i = from; i < poolCount; i++) {
    let poolDetails =
    let poolAddress = await contracts.poolMaker.methods.pools(i).call()
    let pool = new web3.eth.Contract(ntfPoolAbi.abi, poolAddress)
    res.push(poolAddress)
  }
  return res
}

async function start () {
  await loadPools(145)
}

start()