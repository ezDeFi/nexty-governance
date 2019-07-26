import * as Web3 from 'web3'
import {constant} from '../constant'
import { LOAD_INTERVAL } from 'src/constant/constant';
import { setTimeout } from 'timers';

const endPoint = 'https://rpc.nexty.io'
const web3 = new Web3(endPoint)
const PATH = '../../deployed/'

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
const BigNumber = require('bignumber.js')

export class Scanner{
    public socket
    public DB_Pool: any;
    public DB_Queue: any;

    private loadedToBlockNumber

    constructor(_db){
        this.DB_Pool = _db.getModel('Pool')
        this.DB_Queue = _db.getModel('Queue')
        this.loadedToBlockNumber = 0
    }

    public async start() {
        const self = this
        console.log('Looping')

        this.loadedToBlockNumber = await this.getCurrentBlockNumber()

        this.loadPoolList()
        this.loadPool()
        await self.listenEvents()
    }

    public async listenEvents() {
        const self = this
        await setTimeout(async function(){
            const poolObjectList = await self.DB_Pool.getDBInstance().find().select('address -_id')
            const poolList = poolObjectList.map(obj => obj.address);
            let updateList = []
            const toBlock = await self.getCurrentBlockNumber()
            const fromBlock = self.loadedToBlockNumber + 1

            console.log('listen Events from ', fromBlock, ' to ', toBlock)

            const ntfEvents = await contracts.ntfToken.getPastEvents('Transfer', {
                fromBlock: fromBlock,
                toBlock: toBlock
            })
            updateList = await self.getNtfTokenUpdateList(ntfEvents, updateList, poolList)
            const govEvents = await contracts.gov.getPastEvents('allEvents', {
                fromBlock: fromBlock,
                toBlock: toBlock
            })
            updateList = await self.getGovUpdateList(govEvents, updateList, poolList)
            if (updateList.length > 0) {
                for (let i = 0; i < updateList.length; i++) {
                    let address = updateList[i]
                    console.log('address', address)
                    // await self.loadPoolByAddress(address)
                    self.DB_Queue.save({address: address})
                }
            }
            self.loadedToBlockNumber = toBlock
            self.listenEvents()
        }, 1000)
    }

    private async getNtfTokenUpdateList (events, currentList, poolList) {
        let rs = currentList
        if (events.length === 0) return currentList
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

    private async getGovUpdateList (events, currentList, poolList) {
        let rs = currentList
        if (events.length === 0) return currentList
        for (let i = 0; i < events.length; i++) {
          let event = events[i]
          let from = event.returnValues._sealer.toLowerCase()
          // unique and in poolList
          if (!rs.includes(from) && poolList.includes(from)) rs.push(from)
        }
        return rs
    }

    private async loadPoolByAddress(address) {
        const self = this
        const pool = new web3.eth.Contract(ntfPoolAbi.abi, address)
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
        await self.DB_Pool.update({address: address},details)
    }

    public async loadPool () {
        const self = this
        await setTimeout(async function(){
            let ele = await self.DB_Queue.getDBInstance().findOneAndDelete()
            console.log('queue ele', ele)
            if (!ele) {
                ele = await self.DB_Pool.getDBInstance().findOne({}).sort({updatedAt: 1})
            }
            if (ele) {
                const address = (ele.address).toLowerCase()
                await self.loadPoolByAddress(address)
                await self.loadPool()
            }
        }, 500)
      }

      private async getPoolCount () {
        const poolCount = await contracts.poolMaker.methods.getPoolCount().call().catch()
        return await poolCount
      }

      private async loadPoolList () {
        await this.getCurrentBlockNumber()
        console.log('LOADING POOLS')
        const from = await this.DB_Pool.count()
        const poolCount = await this.getPoolCount()
        let res = []
        if (from >= poolCount) return
        for (let i = from; i < poolCount; i++) {
          let poolAddress = await contracts.poolMaker.methods.pools(i).call().catch()
          // const details = await loadPool(poolAddress)
          res.push(poolAddress.toLowerCase())
        //   console.log('loaded to ', i, poolAddress)
          const pool = {
              address: poolAddress,
              pos: i
          }
          await this.DB_Pool.save(pool)
        }
        return res
      }

      private async getCurrentBlockNumber () {
          const blockNumber = await web3.eth.getBlockNumber().catch()
          return Number(blockNumber)
      }
}