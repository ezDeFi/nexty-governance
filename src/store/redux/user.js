import BaseRedux from '@/model/BaseRedux'

class UserRedux extends BaseRedux {
  defineTypes () {
    return ['user']
  }

  defineDefaultState () {
    return {
      is_login: false,
      is_admin: false,

      login_form: {
        privatekey: '',
        loading: false
      },

      wallet: null,
      balance: 0,
      tokenBalance: 0,
      allowance: null,
      depositedBalance: 0,
      managerStatus: '',
      coinbase: '',
      isWithdrawable: false,
      minNtfAmount: 0,
      unlockHeight: 0,
      unlockTime: 0,
      currentBlock: null,
      loginMetamask: false,
      currentAddress: null,
      contract: null,

      profile: {
        web3: null,
        wallet: null,
        contract: null
      }
    }
  }
}

export default new UserRedux()
