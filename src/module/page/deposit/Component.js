import React from 'react'
import LoggedInPage from '../LoggedInPage'
import Footer from '@/module/layout/Footer/Container'
import Tx from 'ethereumjs-tx'
import { Link } from 'react-router-dom'
import './style.scss'
import moment from 'moment/moment'

import { Col, Row, Icon, Form, Input, Button, Dropdown, Breadcrumb, Modal, Menu, Checkbox, Alert, Message, InputNumber, notification } from 'antd'
const FormItem = Form.Item
const MIN_VALUE_DEPOSIT = 1

function isMobileDevice () {
  return (typeof window.orientation !== 'undefined') || (navigator.userAgent.indexOf('IEMobi l e') !== -1)
};

const isMobile = isMobileDevice()

Message.config({
  top: 100
})

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

  validValue (value) {
    var deciPart = (value + '.').split('.')[1]
    //   console.log(deciPart)
    if (deciPart.length > 2) { return value.toFixed(2) } else { return value };
  }

  onAmountChange (value) {
    if (this.state.balance < value) {
      this.setState({
        notEnoughNTY: <p className="alert-no-padding">Your balance is not enough</p>
      })
    } else {
      this.setState({
        notEnoughNTY: null
      })
    }
    this.setState({
      amount: this.validValue(value),
      txhash: null
    })
  }

  ord_renderContent () {
    const self = this
    let alerts = []
    if (this.state.submitted) {
      const error = self.validate()
      if (error) {
        alerts.push(<Alert message={error} type="error" showIcon />)
      }
    }

    // let alerts = [];
    // if(this.state.error) {
    //     alerts.push(<Alert message={this.state.error} type="error" showIcon />)
    // }

    let txhash = null
    if (this.state.txhash) {
      const message = 'Transaction hash: ' + this.state.txhash
      txhash = <Alert description={message} type="success" showIcon />
    }

    // const valid = this.state.package && this.state.amount && (alerts.length == 0);
    // if(valid) {
    //     alerts = [];
    // }

    return (
      <div className="">
        <div className="ebp-header-divider">

        </div>
        <div className="ebp-page">
          <h3 className="text-center">NTF Deposit</h3>
          <div className="ant-col-md-18 ant-col-md-offset-3 text-alert" style={{ 'textAlign': 'left' }}>
            <Row>
              {alerts}
            </Row>
            {this.state.txhash &&
                        <Row>
                          <Col span={6}>
                              TxHash:
                          </Col>
                          <Col xs={24} sm={24} md={24} lg={0} xl={0}/>
                          <Col span={18}>
                            <div>
                              {this.state.txhash} {this.state.isLoading ? <img src='/assets/images/Loading.gif' style = {{ 'width': '20px' }} />
                                : <Icon type="check" style={{ fontSize: 24, color: '#4CAF50' }}/>}
                            </div>
                          </Col>
                        </Row>
            }
          </div>
          <div className="ant-col-md-18 ant-col-md-offset-3" style={{ 'textAlign': 'left' }}>
            <Row>
              <Col span={6}>
                            Your balance:
              </Col>
              <Col xs={24} sm={24} md={24} lg={0} xl={0}/>
              <Col span={18}>
                {parseFloat(this.state.balance).toFixed(2)} NTF
              </Col>
            </Row>
            <Row style={{ 'marginTop': '15px' }}>
              <Col span={6}>
                            Deposited:
              </Col>
              <Col xs={24} sm={24} md={24} lg={0} xl={0}/>
              <Col span={18}>
                {parseFloat(this.state.depositedBalance).toFixed(2)} NTF
              </Col>
            </Row>
            <hr />

            <Row style={{ 'marginTop': '15px' }}>
              <Col span={6}>
                            Amount:
              </Col>
              <Col xs={24} sm={24} md={24} lg={0} xl={0}/>
              <Col span={18}>

                <InputNumber className="defaultWidth"
                  defaultValue={0}
                  value={this.state.amount}
                  onChange={this.onAmountChange.bind(this)}
                />
              </Col>
            </Row>

            <Row style={{ 'marginTop': '15px' }}>
              <Col xs={0} sm={0} md={7} lg={8} xl={8}/>
              <Col xs={24} sm={24} md={10} lg={8} xl={8} className="content-center">
                <Button onClick={this.confirm.bind(this)} type="primary" className="btn-margin-top submit-button">Submit</Button>
              </Col>
            </Row>
          </div>
        </div>
      </div>
    )
  }

  ord_renderBreadcrumb () {
    return (
      <Breadcrumb style={{ 'marginLeft': '16px', 'marginTop': '16px', float: 'right' }}>
        <Breadcrumb.Item><Link to="/dashboard"><Icon type="home" /> Home</Link></Breadcrumb.Item>
        <Breadcrumb.Item> Deposit</Breadcrumb.Item>
      </Breadcrumb>
    )
  }

  confirm () {
    const error = this.validate()
    this.setState({
      error: error,
      submitted: true
    })
    if (error) {
      return
    }

    const content = (
      <div>
        <div>
                    Amount: {this.state.amount} NTF
        </div>
        <div>
                    Estimated reward: coming soon
        </div>
      </div>
    )

    Modal.confirm({
      title: 'Are you sure?',
      content: content,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: () => {
        this.onConfirmDeposit()
      },
      onCancel () {
      }
    })
  }

  approve (amount) {
    var self = this
    self.setState({
      txhash: 'Creating'
    })
    this.props.approve(amount).then((result) => {
      if (!result) {
        Message.error('Cannot send transaction!')
        return false
      }

      var event = self.props.getEventApproval()
      event.watch(function (err, response) {
        if (response.event == 'Approval') { // add require
          self.setState({
            allowance: self.state.allowance + amount
          })
          event.stopWatching()
          self.deposit(self.state.amount)
        }
      })
    })
  }

  deposit (amount) {
    var self = this
    this.props.deposit(amount).then((result) => {
      if (!result) {
        Message.error('Cannot send transaction!')
      }

      var event = self.props.getEventDeposited()
      event.watch(function (err, response) {
        if (response.event == 'Deposited') {
          self.setState({
            tx_success: true,
            isLoading: false
          })
          self.loadData()
          notification.success({
            message: 'Deposited success',
            description: 'Deposited successfully!'
          })
          event.stopWatching()
        }
      })

      Message.success('Transaction has been sent successfully!')
      self.setState({
        txhash: result,
        amount: '',
        submitted: false
      })
    })
  }

  onConfirmDeposit () {
    this.setState({
      isLoading: true
    })

    const self = this
    var toApprove = this.state.amount - this.state.allowance
    // approve if not enough to call deposit
    if (toApprove > 0) {
      this.approve(this.state.amount)
    } else {
      this.deposit(this.state.amount)
    }
    return true
  }

  validate () {
    let errorFields = []
    if ((this.state.amount * (this.state.currentReward / 100)).toFixed(2) > this.state.fundBonus) errorFields.push(<p className="alert-no-padding">Reward Pool is not enough</p>)
    if (this.state.notEnoughNTY) {
      errorFields.push(this.state.notEnoughNTY)
    }
    if (!this.state.amount && this.state.amount !== 0) {
      errorFields.push(<p className="alert-no-padding">Amount is required</p>)
    }
    if (this.state.amount < MIN_VALUE_DEPOSIT) {
      errorFields.push(<p className="alert-no-padding">Amount must be equal or greater than { MIN_VALUE_DEPOSIT } NTF</p>)
    }
    if (errorFields.length == 0) return null
    return (
      <div>
        {errorFields}
      </div>
    )
    // return errorFields.join(", "); //+ " is required.";
  }
}
