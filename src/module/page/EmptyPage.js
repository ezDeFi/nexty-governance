import React from 'react' // eslint-disable-line
import BasePage from '@/model/BasePage'

export default class extends BasePage {
  ord_renderPage () { // eslint-disable-line
    return (
      <div className="p_emptyPage">
        {this.ord_renderContent()}
      </div>
    )
  }

  ord_renderContent () { // eslint-disable-line
    return null
  }
}
