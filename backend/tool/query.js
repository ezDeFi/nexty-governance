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
    coinbase: await methods.getCoinbase().call(),
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

async function loadPoolList (from) {
  console.log('LOADING POOLS')
  const poolCount = await getPoolCount()
  let res = []
  for (let i = from; i < poolCount; i++) {
    let poolAddress = await contracts.poolMaker.methods.pools(i).call()
    // const details = await loadPool(poolAddress)
    res.push(poolAddress.toLowerCase())
    console.log('loaded to ', i)
  }
  return res
}

/*
  EVENT EXAMPLE
   { address: '0x2c783AD80ff980EC75468477E3dD9f86123EcBDa',
    blockNumber: 20757451,
    transactionHash:
     '0xb19dca677f61a1e64c9aa2788482fe888056673f04eb19811288de2e4ad66ac9',
    transactionIndex: 0,
    blockHash:
     '0x0776a46875dd0453461ceb334aadc58069fcc7cd5874f020396434b8fe994931',
    logIndex: 0,
    removed: false,
    id: 'log_a0bc7c10',
    returnValues:
     Result {
       '0': '0x2Ae68c577981e788D1A4a3aBf963Da8b73f14f73',
       '1': '0x158ED884bd98397D0D9439551dA2AdF23B29844F',
       '2': '2000000000000000000',
       from: '0x2Ae68c577981e788D1A4a3aBf963Da8b73f14f73',
       to: '0x158ED884bd98397D0D9439551dA2AdF23B29844F',
       value: '2000000000000000000' },
    event: 'Transfer',
    signature:
     '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
    raw:
     { data:
        '0x0000000000000000000000000000000000000000000000001bc16d674ec80000',
       topics: [Array] } }
*/

// list of pools to reload data
async function getUpdateList (events, poolList) {
  if (events.length === 0) return []
  let rs = []
  for (let i = 0; i < events.length; i++) {
    let event = events[i]
    let from = event.returnValues.from.toLowerCase()
    let to = event.returnValues.to.toLowerCase()
    // unique and in poolList
    if (!rs.includes(from) && poolList.includes(from)) rs.push(from)
    if (!rs.includes(to) && poolList.includes(to)) rs.push(to)
  }
  return rs
}

async function start () {
  const poolList = await loadPoolList(0)
  const rs = await contracts.ntfToken.getPastEvents('Transfer', {
    fromBlock: 20748591,
    toBlock: 'latest'
  })
  getUpdateList(rs, poolList)
}

start()

/*
    POOL'S DETAILS
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

/*  GOVERNANCE EVENTS TRACKING
    _sealer = any pool => reload pool's details

    event Deposited(address _sealer, uint _amount);
    event Joined(address _sealer, address _signer);
    event Left(address _sealer, address _signer);
    event Withdrawn(address _sealer, uint256 _amount);
*/

/*
    NTF TOKEN EVENT TRACKING
    from or to = any pool => reload pool's details
    
    event Transfer(address indexed from, address indexed to, uint256 value);
*/