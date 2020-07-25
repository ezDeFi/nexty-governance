import BaseService from '../../model/BaseService'
import Web3 from 'web3'
import _ from 'lodash' // eslint-disable-line
import { WEB3, CONTRACTS } from '@/constant'
import ntfTokenABI from '../../../deployed/NtfTokenABI.json'


const web3 = new Web3(new Web3.providers.WebsocketProvider('wss://ws.nexty.io'))

const ntfTokenAddress = '0x2c783ad80ff980ec75468477e3dd9f86123ecbda'

const ntfToken = new web3.eth.Contract(ntfTokenABI, ntfTokenAddress)
export default class extends BaseService {
  // acctions
  async approve (_amount) {
    let store = this.store.getState()
    let methods = store.contracts.ntfToken.methods
    // console.log(store.contracts.ntfToken)
    let wallet = store.user.wallet
    let _to = store.pool.selectedPool
    console.log("selectedPool", store.pool.selectedPool)
    console.log(wallet)
    return await methods.approve(_to.toString(), _amount.toString()).send({ from: wallet, gasPrice: '0' })
  }
  // load data
  async loadMyNtfBalance () {
    // const store = this.store.getState()
    // let wallet = store.user.wallet
    let _myNtfBalance = await this.getNtfBalanceByAddress('0x61caad7b6814f8d7b60bfa62dd2fc1f4d49c0872')
    const userRedux = this.store.getRedux('user')
    await this.dispatch(userRedux.actions.ntfBalance_update(_myNtfBalance))
  }

  async getAllowance () {
    const store = this.store.getState()
    if (store.contracts.ntfToken === undefined) return 0
    let wallet = store.user.wallet
    const methods = store.contracts.ntfToken.methods
    const allowance = await methods.allowance(wallet, WEB3.PAGE.NextyManager.ADDRESS).call()
    const userRedux = this.store.getRedux('user')
    await this.dispatch(userRedux.actions.allowance_update(allowance))
  }

  // read functions
  async getNtfBalanceByAddress (_address) {
    console.log('address',_address)
    const store = this.store.getState()
    if (store.contracts.ntfToken === undefined) return 0
    // const methods = store.contracts.ntfToken.methods
    console.log(await ntfToken.methods.balanceOf(_address).call())
    return await ntfToken.methods.balanceOf(_address).call()
  }
}
