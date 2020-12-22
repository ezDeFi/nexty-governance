import BaseService from '../model/BaseService'
import Web3 from 'web3'
import _ from 'lodash' // eslint-disable-line
import WalletService from '@/service/WalletService'
import { WEB3 } from '@/constant'
import stores from '@/store'

let web3 = new Web3(new Web3.providers.HttpProvider(WEB3.HTTP))
export default class extends BaseService {
  async decryptWallet (privatekey) {
    const userRedux = this.store.getRedux('user')

    let web3 = new Web3(new Web3.providers.HttpProvider(WEB3.HTTP))

    const NTFToken = web3.eth.contract(WEB3.PAGE['NTFToken'].ABI)
    const NTFTokenContract = NTFToken.at(WEB3.PAGE['NTFToken'].ADDRESS)

    const NextyManager = web3.eth.contract(WEB3.PAGE['NextyManager'].ABI)
    const NextyManagerContract = NextyManager.at(WEB3.PAGE['NextyManager'].ADDRESS)
    const contract = {
      NTFToken: NTFTokenContract,
      NextyManager: NextyManagerContract
    }

    const wallet = new WalletService(privatekey)
    const walletAddress = wallet.getAddressString()
    console.log("adressssss", walletAddress)

    if (!walletAddress) {
      return
    }

    web3.eth.defaultAccount = walletAddress
    wallet.balance = web3.eth.getBalance('0x61caAD7b6814f8D7B60bfa62dd2fC1f4d49c0872')
    console.log('xxx walletAddress', walletAddress)
    await this.dispatch(userRedux.actions.currentAddress_update(walletAddress))
    await this.dispatch(userRedux.actions.wallet_update(walletAddress))
    // const owner = contract.owner()
    /*
        const owner = {
            NTFToken: NTFTokenContract.owner(),
            NextyManager : NextyManagerContract.owner()
        }
*/
    // const owner = contract.owner()
    const contractAdress = {
      NTFToken: WEB3.PAGE['NTFToken'].ADDRESS,
      NextyManager: WEB3.PAGE['NextyManager'].ADDRESS
    }
    // console.log("owner=" + owner)
    // console.log("address=" + walletAddress)
    /*
        if (walletAddress === owner) {
            await this.dispatch(userRedux.actions.is_admin_update(true))
        }
        */
    sessionStorage.setItem('contract-adress', contractAdress) // eslint-disable-line
    // await this.dispatch(userRedux.actions.is_login_update(true))
    await this.dispatch(userRedux.actions.profile_update({
      web3,
      wallet,
      contract
    }))
    await this.dispatch(userRedux.actions.login_form_reset())

    return true
  }

  async metaMaskLogin (address) {
    const userRedux = this.store.getRedux('user')
    const contractsRedux = stores.getRedux('contracts')
    let web3 = new Web3(new Web3.providers.HttpProvider(WEB3.HTTP))

    // const NTFTokenContract = new web3.eth.Contract(WEB3.PAGE['NTFToken'].ABI, WEB3.PAGE['NTFToken'].ADDRESS)
    // // const NTFTokenContract = NTFToken.at(WEB3.PAGE['NTFToken'].ADDRESS)

    // const NextyManagerContract = new web3.eth.Contract(WEB3.PAGE['NextyManager'].ABI, WEB3.PAGE['NextyManager'].ADDRESS)
    // // const NextyManagerContract = NextyManager.at(WEB3.PAGE['NextyManager'].ADDRESS)
    // const contract = {
    //   NTFToken: NTFTokenContract,
    //   NextyManager: NextyManagerContract
    // }
    web3.eth.defaultAccount = address
    // await this.dispatch(userRedux.actions.is_login_update(true))
    await this.dispatch(userRedux.actions.currentAddress_update(address))
    await this.dispatch(userRedux.actions.wallet_update(address))
    // await this.dispatch(userRedux.actions.profile_update({
    //   web3,
    //   contract
    // }))
    const contracts = {
    //   NextyManager: new web3.eth.Contract(WEB3.PAGE['NextyManager'].ABI, WEB3.PAGE['NextyManager'].ADDRESS),
    //   NtfToken: new web3.eth.Contract(WEB3.PAGE['NTFToken'].ABI, WEB3.PAGE['NTFToken'].ADDRESS),
    //   NtfPool: new web3.eth.Contract(WEB3.PAGE['NtfPool'].ABI, WEB3.PAGE['NTFToken'].ADDRESS),
      PoolMaker: new web3.eth.Contract(WEB3.PAGE['PoolMaker'].ABI, WEB3.PAGE['PoolMaker'].ADDRESS)
    }
    // await store.dispatch(userRedux.actions.loginMetamask_update(true))
    await stores.dispatch(userRedux.actions.contract_update(contracts))
    // await stores.dispatch(contractsRedux.actions.ntfToken_update(contracts.NtfToken))
    // await stores.dispatch(contractsRedux.actions.ntfPool_update(contracts.NtfPool))
    // await stores.dispatch(contractsRedux.actions.poolMaker_update(contracts.PoolMaker))
    await stores.dispatch(userRedux.actions.web3_update(web3))

    return true
  }

  async depositProcess () {
    const userRedux = this.store.getRedux('user')
    this.dispatch(userRedux.actions.depositing_update(true))
  }

  async depositStop () {
    const userRedux = this.store.getRedux('user')
    this.dispatch(userRedux.actions.depositing_update(false))
  }

  async getBalance () {
    const userRedux = this.store.getRedux('user')
    const storeUser = this.store.getState().user
    let { web3, wallet } = storeUser.profile
    const walletAddress = storeUser.currentAddress
    const balance = await web3.eth.getBalance(walletAddress)
    this.dispatch(userRedux.actions.balance_update(web3.fromWei(balance, 'ether')))
  }

  async getBalanceBeta () {
    const userRedux = this.store.getRedux('user')
    const storeUser = this.store.getState().user
    let { wallet } = storeUser
    const balance = await web3.eth.getBalance(wallet)
    this.dispatch(userRedux.actions.balance_update(balance))
  }

  async getWallet () {
    const userRedux = this.store.getRedux('user')
    const storeUser = this.store.getState().user
    let { wallet } = storeUser.profile
    const walletAddress = storeUser.currentAddress

    this.dispatch(userRedux.actions.wallet_update(walletAddress))
  }

  async loadBlockNumber () {
    const userRedux = this.store.getRedux('user')
    const storeUser = this.store.getState().user
    let { web3 } = storeUser
    const _blockNumber = await web3.eth.getBlockNumber()
    await this.dispatch(userRedux.actions.blockNumber_update(_blockNumber))
  }

  async logout () {
    const userRedux = this.store.getRedux('user')
    const tasksRedux = this.store.getRedux('task')

    return new Promise((resolve) => {
      this.dispatch(userRedux.actions.is_login_update(false))
      this.dispatch(userRedux.actions.is_admin_update(false))
      this.dispatch(userRedux.actions.loginMetamask_update(false))
      this.dispatch(userRedux.actions.profile_reset())
      this.dispatch(tasksRedux.actions.all_tasks_reset())
      // sessionStorage.clear() // eslint-disable-line
      resolve(true)
    })
  }
}
