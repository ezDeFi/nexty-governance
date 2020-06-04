import BaseRedux from '@/model/BaseRedux'

class PoolRedux extends BaseRedux {
  defineTypes () {
    return ['newPool']
  }

  defineDefaultState () {
    return {
      name: null,
      compRate: null,
      website: null,
      location: null,
      logo: null,
      poolNames: [],
      poolCount: 0,
      selectedPool: null,
      mySelectedPool: null,
      holdingNtyBalance: 0,
      holdingNtfBalance: 0,
      govNtfBalance: 0,
      owner: null,
      status: null,
      poolsPortal: [],
    }
  }
}

export default new PoolRedux()
