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
      loginMetamask: true,
      currentAddress: null,
      contract: null,
      readContract: null,
      stakeLockHeight: 0,

      profile: {
        web3: null,
        wallet: null,
        contract: null,
        readWeb3: null
      },

      // pool-master
      web3: null,
      readWeb3: null,
      blockNumber: 0,
      ntfBalance: 0,
      ntfDeposited: 0,
      rewardBalance: 0,
      isLocking: false,
      myPendingOutAmount: 0,
      depositing: false
    }
  }
}

export default new UserRedux()
