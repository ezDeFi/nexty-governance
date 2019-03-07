import React from 'react' // eslint-disable-line
import LoggedInPage from '../LoggedInPage'
import Footer from '@/module/layout/Footer/Container' // eslint-disable-line
import Tx from 'ethereumjs-tx' // eslint-disable-line
import { Link } from 'react-router-dom' // eslint-disable-line

import './style.scss'

import { Col, Row, Icon, Form, Breadcrumb } from 'antd' // eslint-disable-line

export default class extends LoggedInPage {
  componentDidMount () {
    this.loadData()
  }

  loadData () {
    this.props.getTokenBalance(this.props.currentAddress)
    this.props.getDepositedBalance()
    this.props.getStatus()
    this.props.getCoinbase()
    this.props.getAllowance()
  }

  getStatus (status) {
    switch (status) {
      case 0: return 'PENDING_ACTIVE'
      case 1: return 'ACTIVE'
      case 2: return 'PENDING_WITHDRAW'
      case 3: return 'WITHDRAWN'
      case 127: return 'PENALIZED'
      default: return 'UNKNOWN'
    }
  }

  ord_renderContent () { // eslint-disable-line
    return (
      <div className="p_Profile">
        <div className="ebp-header-divider">

        </div>
        <div className="ebp-page content-center">
          <Row>
            <Col span={12} style={{ 'display': 'block' }}>
              <span className="text-stat">Holding</span>
              <h1>{parseFloat(this.props.balance).toFixed(2)} NTF </h1>
            </Col>
            <Col xs={24} sm={24} md={24} lg={0} xl={0}/>
            <Col span={12}>
              <span className="text-stat">Deposited</span>
              <h1>{parseFloat(this.props.depositedBalance).toFixed(2)} NTF</h1>
            </Col>
          </Row>

          <Row>
            <Col span={12} style={{ 'display': 'block' }}>
              <span className="text-stat">Status</span>
              <h1>{this.getStatus(this.props.managerStatus)}</h1>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <span className="text-stat">Coinbase</span>
              <h4>{this.state.coinbase === '0x0000000000000000000000000000000000000000' ? 'Not set' : this.props.coinbase}</h4>
            </Col>
          </Row>
          <div className="ebp-header-divider dashboard-rate-margin">

          </div>

        </div>
      </div>
    )
  }

  ord_renderBreadcrumb () { // eslint-disable-line
    return (
      <Breadcrumb style={{ 'marginLeft': '16px', 'marginTop': '16px', float: 'right' }}>
        <Breadcrumb.Item><Link to="/dashboard"><Icon type="home" /> Home</Link></Breadcrumb.Item>
        <Breadcrumb.Item> Dashboard</Breadcrumb.Item>
      </Breadcrumb>
    )
  }
}
