import React from 'react' // eslint-disable-line
import ReactDOM from 'react-dom'
import _ from 'lodash'
import { BrowserRouter, Route, Switch } from 'react-router-dom' // eslint-disable-line
import { Provider } from 'react-redux' // eslint-disable-line
import { ConnectedRouter } from 'react-router-redux' // eslint-disable-line
import store from '@/store'
import config from '@/config'
import { USER_ROLE } from '@/constant'
import { api_request } from './util' // eslint-disable-line
import UserService from '@/service/UserService'
import NtfPoolService from '@/service/contracts/ntfPoolService'
import { Helmet } from 'react-helmet'
import Web3 from '@/assets/js/web3'
import { WEB3 } from '@/constant'

import './boot'
import './style/index.scss'

const middleware = (render, props) => {
  return render
}

const App = () => { // eslint-disable-line
  return (
    <div>
      <Helmet>
        {/* <script defer src="/assets/js/web310.js"></script> */}
      </Helmet>
      <Switch id="ss-main">
        {_.map(config.router, (item, i) => {
          const props = _.omit(item, ['page', 'path', 'type'])
          const R = item.type || Route // eslint-disable-line
          return (
            <R path={item.path} key={i} exact component={item.page} {...props} />
          )
        })}
      </Switch>
    </div>
  )
}

const render = () => {
  ReactDOM.render(
    <Provider store={store}>
      <ConnectedRouter middleware={middleware} history={store.history}>
        <App />
      </ConnectedRouter>
    </Provider>,
    document.getElementById('ss-root')
  )
}

const userRedux = store.getRedux('user')
const contractsRedux = store.getRedux('contracts')
const userService = new UserService()
const ntfPoolService = new NtfPoolService()
let isRequest = false

async function setupCallWeb3 () {
  let web3 = new Web3(new Web3.providers.HttpProvider('https://rpc.nexty.io'))
  // let web3 = new Web3(new Web3.providers.WebsocketProvider("wss://ws.nexty.io"));
  const contracts = {
    NextyManager: new web3.eth.Contract(WEB3.PAGE['NextyManager'].ABI, WEB3.PAGE['NextyManager'].ADDRESS),
    NtfToken: new web3.eth.Contract(WEB3.PAGE['NTFToken'].ABI, WEB3.PAGE['NTFToken'].ADDRESS),
    NtfPool: new web3.eth.Contract(WEB3.PAGE['NtfPool'].ABI, WEB3.PAGE['NTFToken'].ADDRESS),
    PoolMaker: new web3.eth.Contract(WEB3.PAGE['PoolMaker'].ABI, WEB3.PAGE['PoolMaker'].ADDRESS)
  }

  await store.dispatch(userRedux.actions.loginMetamask_update(true))
  await store.dispatch(userRedux.actions.contract_update(contracts))
  await store.dispatch(contractsRedux.actions.ntfToken_update(contracts.NtfToken))
  await store.dispatch(contractsRedux.actions.ntfPool_update(contracts.NtfPool))
  await store.dispatch(contractsRedux.actions.poolMaker_update(contracts.PoolMaker))
  await store.dispatch(userRedux.actions.web3_update(web3))
  await userService.metaMaskLogin('0x0000000000000000000000000000000000000000')
  const pool_id = sessionStorage.getItem('pool_id')
  if (pool_id) {
    // userService.path.push(`/pool?id=${pool_id}`)
  } else {
  // userService.path.push('/portal')
  }
}

let isLoggedIn = false

function setupWeb3 () {
  window.web3.eth.getAccounts(async (err, accounts) => {
    if (err) return
    if (accounts.length > 0) {
      window.web3.version.getNetwork((err, networkId) => {
        if (err) {
          console.error(err);
          return;
        }

        // detect account switch
        const wallet = store.getState().user.wallet;
        isLoggedIn = isLoggedIn && wallet === accounts[0];

        if (!isLoggedIn) {
          const web3 = new Web3(window.ethereum)

          const contract = {
            NextyManager: new web3.eth.Contract(WEB3.PAGE['NextyManager'].ABI, WEB3.PAGE['NextyManager'].ADDRESS),
            NtfToken: new web3.eth.Contract(WEB3.PAGE['NTFToken'].ABI, WEB3.PAGE['NTFToken'].ADDRESS),
            NtfPool: new web3.eth.Contract(WEB3.PAGE['NtfPool'].ABI, WEB3.PAGE['NTFToken'].ADDRESS),
            PoolMaker: new web3.eth.Contract(WEB3.PAGE['PoolMaker'].ABI, WEB3.PAGE['PoolMaker'].ADDRESS)
          }

          store.dispatch(userRedux.actions.loginMetamask_update(true))
          store.dispatch(userRedux.actions.is_login_update(true))
          store.dispatch(userRedux.actions.contract_update(contract))
          store.dispatch(contractsRedux.actions.ntfToken_update(contract.NtfToken))
          store.dispatch(contractsRedux.actions.ntfPool_update(contract.NtfPool))
          store.dispatch(contractsRedux.actions.poolMaker_update(contract.PoolMaker))
          store.dispatch(userRedux.actions.web3_update(web3))
          userService.metaMaskLogin(accounts[0])

            const pool_id = sessionStorage.getItem('pool_id')
            if (pool_id) {
              // userService.path.push(`/pool?id=${pool_id}`)
            } else {
              // userService.path.push('/portal')
            }

          userService.metaMaskLogin(accounts[0])
          isLoggedIn = true

          // simple trick: not work for entering .../login directly to the browser
          if (userService.path.location.pathname === '/login') {
            userService.path.goBack();
          }
        }
      })
    } else {
        if (!isRequest) {
            isRequest = true
            await window.ethereum.enable()
        }
        store.dispatch(userRedux.actions.loginMetamask_update(false))
        isLoggedIn = false
    }
  })
}

if (window.ethereum) {
  setupWeb3()
  if (window.web3.currentProvider.publicConfigStore) {
    window.web3.currentProvider.publicConfigStore.on('update', async () => {
      setupWeb3()
    })
  }
} else {
  store.dispatch(userRedux.actions.loginMetamask_update(false))
}

render()
