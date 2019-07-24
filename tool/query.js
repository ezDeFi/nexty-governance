const Web3 = require('web3')
const endPoint = 'https://rpc.nexty.io'
const web3 = new Web3(endPoint)
const PATH = '../deployed/'

const ntfAbi = require(PATH + 'NtfToken.json')
const ntfAddress = '0x2c783ad80ff980ec75468477e3dd9f86123ecbda'

const govAbi = require(PATH + 'NextyGovernance.json')
const govAddress = '0x0000000000000000000000000000000000012345'

const poolMakerAbi = require(PATH + 'pool/PoolMaker.json')
const poolMakerAddress = '0xd4e5390c22782841B28F65A3B8F0cbd82f2b775E'

const CONTRACTS_DATA = {
  ntfToken: {
    abi: ntfAbi,
    address: ntfAddress
  },
  gov: {
    abi: govAbi,
    address: govAddress
  },
  poolMaker: {
    abi: poolMakerAbi,
    address: poolMakerAddress
  }
}

const contracts = {
  ntfToken: new web3.eth.Contract(CONTRACTS_DATA.ntfToken.abi, CONTRACTS_DATA.ntfToken.address),
  gov: new web3.eth.Contract(CONTRACTS_DATA.gov.abi, CONTRACTS_DATA.gov.address),
  poolMaker: new web3.eth.Contract(CONTRACTS_DATA.poolMaker.abi, CONTRACTS_DATA.poolMaker.address)
}

async function start () {
  const poolCount = await contracts.poolMaker.methods.getPoolCount().call()
  console.log('xxx', poolCount)
}

start()