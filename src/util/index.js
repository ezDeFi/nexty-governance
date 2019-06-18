import { connect } from 'react-redux'
import _ from 'lodash'
import { withRouter } from 'react-router'
import { api_request, upload_file } from './request' // eslint-disable-line

/**
 * Helper for React-Redux connect
 *
 * @param component
 * @param mapState - map state to props
 * @param mapDispatch - map dispatch to props
 */
export const createContainer = (component, mapState, mapDispatch = _.noop()) => {
  return withRouter(connect(mapState, mapDispatch)(component))
}

export const constant = (moduleName, detailArray) => {
  const result = {}
  _.each(detailArray, (detail) => {
    result[detail] = `${moduleName}/${detail}`
  })

  return result
}

export const validURL = (str) => {
  var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  return !!pattern.test(str);
}

export {
  api_request, // eslint-disable-line
  upload_file // eslint-disable-line
}
