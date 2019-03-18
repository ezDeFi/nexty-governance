import { createContainer } from '@/util'
import Component from './Component'

export default createContainer(Component, (state) => {
  return {
    loginMetamask: state.user.loginMetamask,
    isLogin: state.user.is_login
  }
})
