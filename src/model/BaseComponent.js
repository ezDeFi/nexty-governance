import React from 'react'
import _ from 'lodash'

export default class extends React.Component {
  constructor (p) {
    super(p)

    this.state = _.extend({

    }, this.ord_states())

    this.$p = this.ord_props()
    this.$f = this.ord_methods()

    this.ord_init()
  }
  render () {
    return this.ord_render(this.$p)
  }

  // could be override
  ord_init () {} // eslint-disable-line
  ord_render () { return null } // eslint-disable-line
  ord_props () { // eslint-disable-line
    return {}
  }
  ord_states () { // eslint-disable-line
    return {}
  }
  ord_methods () { // eslint-disable-line
    return {}
  }
};
