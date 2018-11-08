import React from 'react'
import LoggedInPage from '../LoggedInPage'
import Footer from '@/module/layout/Footer/Container'
import Tx from 'ethereumjs-tx'
import { Link } from 'react-router-dom'

import './style.scss'

import { Col, Row, Icon, Form, Input, Button, Dropdown, Breadcrumb } from 'antd'
const FormItem = Form.Item

function isMobileDevice () {
  return (typeof window.orientation !== 'undefined') || (navigator.userAgent.indexOf('IEMobi l e') !== -1)
};

const isMobile = isMobileDevice()

export default class extends LoggedInPage {
  componentDidMount () {
    this.loadData()
  }

  loadData () {
    console.log('Wallet', this.props.profile.wallet.getAddressString())
    this.setState({
      walletAddress: this.props.profile.wallet.getAddressString()
    })

    console.log('NTF Amount', this.props.getTokenBalance(this.props.profile.wallet.getAddressString()))
    this.setState({
      balance: this.props.getTokenBalance(this.props.profile.wallet.getAddressString())
    })

    console.log('Deposited NTF Amount', this.props.getDepositedBalance())
    this.setState({
      depositedBalance: this.props.getDepositedBalance()
    })

    console.log('Status', this.props.getStatus())
    this.setState({
      status: this.props.getStatus()
    })

    console.log('Coinbase', this.props.getCoinbase())
    this.setState({
      coinbase: this.props.getCoinbase()
    })

    console.log('Allowance', this.props.getAllowance())
    this.setState({
      allowance: this.props.getAllowance()
    })
  }

  getStatus (status) {
    switch (status) {
      case 0: return 'PENDING_ACTIVE'
        break
      case 1: return 'ACTIVE'
        break
      case 2: return 'PENDING_WITHDRAW'
        break
      case 3: return 'WITHDRAWN'
        break
      case 127: return 'PENALIZED'
        break
      default: return 'UNKNOWN'
    }
  }

  ord_renderContent () {
    let { wallet, web3 } = this.props.profile
    if (!wallet || !web3) {
      return null
    }

    const balance = parseFloat(web3.fromWei(wallet.balance, 'ether'))
    const address = wallet.getAddressString()

    return (
      <div className="p_Profile">
        <div className="ebp-header-divider">

        </div>
        <div className="ebp-page content-center">
          <Row>
            <Col span={12} style={{ 'display': 'block' }}>
              <span className="text-stat">Holding</span>
              <h1>{parseFloat(this.state.balance).toFixed(2)} NTF </h1>
            </Col>
            <Col xs={24} sm={24} md={24} lg={0} xl={0}/>
            <Col span={12}>
              <span className="text-stat">Deposited</span>
              <h1>{parseFloat(this.state.depositedBalance).toFixed(2)} NTF</h1>
            </Col>
          </Row>

          <Row>
            <Col span={12} style={{ 'display': 'block' }}>
              <span className="text-stat">Status</span>
              <h1>{this.getStatus(this.state.status)}</h1>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <span className="text-stat">Coinbase</span>
              <h4>{this.state.coinbase == '0x0000000000000000000000000000000000000000' ? 'Not set' : this.state.coinbase}</h4>
            </Col>
          </Row>
          <div className="ebp-header-divider dashboard-rate-margin">

          </div>

        </div>
      </div>
    )
  }

  ord_renderBreadcrumb () {
    return (
      <Breadcrumb style={{ 'marginLeft': '16px', 'marginTop': '16px', float: 'right' }}>
        <Breadcrumb.Item><Link to="/dashboard"><Icon type="home" /> Home</Link></Breadcrumb.Item>
        <Breadcrumb.Item> Dashboard</Breadcrumb.Item>
      </Breadcrumb>
    )
  }
}
