import BaseRedux from '@/model/BaseRedux'

class ContractRedux extends BaseRedux {
  defineTypes () {
    return ['contracts']
  }

  defineDefaultState () {
    return {
      web3: null,
      endpoint: null,
      ntfToken: null,
      readNtfToken: null,
      ntfPool: null,
      myNtfPool: null,
      poolMaker: null,
      nextyGovernance: null
    }
  }
}

export default new ContractRedux()
