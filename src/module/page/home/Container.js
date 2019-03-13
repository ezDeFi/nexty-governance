import { createContainer } from '@/util'
import Component from './Component'
import _ from 'lodash'

import { TASK_CATEGORY, TASK_TYPE } from '@/constant'

export default createContainer(Component, (state, ownProps) => {

  return {
    ...state.user
  }
}, () => {

})
