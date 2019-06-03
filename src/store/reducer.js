import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'

import task from './redux/task'
import user from './redux/user'
import community from './redux/community'
import pool from './redux/pool'
import contracts from './redux/contracts'

const default_state = { // eslint-disable-line
  init: false
}

const appReducer = (state = default_state, action) => {
  switch (action.type) {

  }

  return state
}

export default combineReducers({
  app: appReducer,
  router: routerReducer,
  task: task.getReducer(),
  user: user.getReducer(),
  community: community.getReducer(),
  pool: pool.getReducer(),
  contracts: contracts.getReducer()
})
