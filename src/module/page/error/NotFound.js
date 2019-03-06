import React from 'react' // eslint-disable-line
import StandardPage from '../StandardPage'

export default class extends StandardPage {
  ord_renderContent () { // eslint-disable-line
    return (
      <div className="ebp-page">
        <h1>404, not found</h1>
      </div>

    )
  }
}
