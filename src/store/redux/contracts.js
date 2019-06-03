import BaseRedux from '@/model/BaseRedux'

class ContractRedux extends BaseRedux {
  defineTypes () {
    return ['contracts']
  }

  defineDefaultState () {
    return {
      web3: null,
      ntfToken: null,
      ntfPool: null,
      myNtfPool: null,
      poolMaker: null,
      nextyGovernance: null
    }
  }
}

export default new ContractRedux()
