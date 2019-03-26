import { createContainer, goPath } from '@/util' // eslint-disable-line
import Component from './Component'
import UserService from '@/service/UserService'
import { message } from 'antd'

message.config({
  top: 100
})

export default createContainer(Component, (state) => {
  return {
    ...state.user.login_form
  }
}, () => {
  const userService = new UserService()

  return {
    async decryptWallet (privateKey) {
      try {
        const rs = await userService.decryptWallet(privateKey)

        if (rs) {
          message.success('Login successfully')
          userService.path.push('/manage')
        }
      } catch (err) {
        message.destroy()
        message.error(err.message)
      }
    }
  }
})
