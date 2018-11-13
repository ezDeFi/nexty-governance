import React from 'react' // eslint-disable-line
import LoggedInPage from '../LoggedInPage'
import _ from 'lodash' // eslint-disable-line

import './style.scss'

import { Col, Row, Breadcrumb, Icon } from 'antd' // eslint-disable-line

export default class extends LoggedInPage {
  componentDidMount () {
  }

  componentWillUnmount () {
  }

  getCoreTenets () {
    return [
      'Organizers are decided by a transparent voting system',
      'Voting power (EVP) is only earned through participation',
      'Nexty can only veto tasks and define the ELA rewards'
    ]
  }

  ord_renderContent () { // eslint-disable-line
    const backdropStyle = {
      backgroundPosition: '0 50%'
    }

    return (
      <div className="c_Home">
        <div className="d_topBackdrop" style={backdropStyle}>
          <div className="d_topBackdrop_title">
                        Nexty
          </div>
        </div>
        <div className="horizGap">

        </div>
        <Row className="d_rowPrograms">
          <Col span={8} className="d_colProgram_middle">
            <a href="/">
              <img src="/assets/images/ss.jpeg" />
              <h3>

              </h3>
            </a>
          </Col>
        </Row>
      </div>
    )
  }

  ord_renderBreadcrumb () { // eslint-disable-line
    return (
      <Breadcrumb style={{ 'marginLeft': '16px', 'marginTop': '16px', float: 'right' }}>
        <Breadcrumb.Item><Icon type="home" /> Home</Breadcrumb.Item>
      </Breadcrumb>
    )
  }
}
