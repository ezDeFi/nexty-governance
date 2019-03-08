import React from 'react' // eslint-disable-line
import BaseComponent from './BaseComponent'
import { spring, Motion } from 'react-motion' // eslint-disable-line
import _ from 'lodash' // eslint-disable-line
import store from '@/store'

/**
 noWobble: {stiffness: 170, damping: 26}, // the default, if nothing provided
 gentle: {stiffness: 120, damping: 14},
 wobbly: {stiffness: 180, damping: 12},
 stiff: {stiffness: 210, damping: 20},
 */
export default class extends BaseComponent {
  ord_render (p) { // eslint-disable-line
    return (<div>{this.ord_renderPage(p)}</div>)
  }

  ord_init () { // eslint-disable-line
    const storeUser = store.getState().user

    if (!storeUser) {
      return
    }
    const is_login = storeUser.is_login // eslint-disable-line
    const is_admin = storeUser.is_admin // eslint-disable-line

    if (!is_login && !storeUser.loginMetamask) { // eslint-disable-line
      this.ord_checkLogin(is_login, is_admin)
    }
  }

  ord_animate () { // eslint-disable-line
    return {
      from: [0, 50],
      to: [1, 0],
      style_fn: (values) => {
        return {
          position: 'relative',
          opacity: values[0],
          left: values[1]
        }
      }
    }
  }

  ord_renderPage () { // eslint-disable-line
    return null
  }

  componentDidMount () { // eslint-disable-line
  }

  ord_checkLogin (isLogin, isAdmin) { // eslint-disable-line
    let url = window.location.pathname

    if (!isLogin && url !== '/user-guide') {
      return this.props.history.replace('/login')
    }
  }
}
