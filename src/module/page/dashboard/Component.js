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
      case 0: return 'Ready'
      case 1: return 'Active'
      case 2: return 'Inactive'
      case 3: return 'Withdrawn'
      case 127: return 'Penalized'
      default: return 'Unknown'
    }
  }

  ord_renderContent () { // eslint-disable-line
    return (
      <div className="">
        <div className="ebp-header-divider">
        </div>

        <div className="ebp-page">
          <h3 className="text-center">Dashboard</h3>
          <div className="ant-col-md-18 ant-col-md-offset-3 text-alert" style={{ 'textAlign': 'left' }}>
            <Row>
              <Col span={6}>
                Holding:
              </Col>
              <Col xs={24} sm={24} md={24} lg={0} xl={0}/>
              <Col span={18}>
                {parseFloat(this.props.tokenBalance)/1e18} NTF
              </Col>
            </Row>
            <Row style={{ 'marginTop': '15px' }}>
              <Col span={6}>
                Deposited:
              </Col>
              <Col xs={24} sm={24} md={24} lg={0} xl={0}/>
              <Col span={18}>
                {parseFloat(this.props.depositedBalance)/1e18} NTF
              </Col>
            </Row>
            <Row style={{ 'marginTop': '15px' }}>
              <Col span={6}>
                Status:
              </Col>
              <Col xs={24} sm={24} md={24} lg={0} xl={0}/>
              <Col span={18}>
                {this.getStatus(this.props.managerStatus)}
              </Col>
            </Row>
            <div className="ebp-header-divider dashboard-rate-margin">
            </div>
          </div>
        </div>
      </div>
    )
  }

  ord_renderBreadcrumb () { // eslint-disable-line
    return (
      <Breadcrumb style={{ 'marginLeft': '16px', 'marginTop': '16px', float: 'right' }}>
        <Breadcrumb.Item><Link to="/manage"><Icon type="home" /> Home</Link></Breadcrumb.Item>
        <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
      </Breadcrumb>
    )
  }
}
