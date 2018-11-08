import React from 'react'
import LoggedInPage from '../LoggedInPage'
import Footer from '@/module/layout/Footer/Container'
import Tx from 'ethereumjs-tx'
import { Link } from 'react-router-dom'
import './style.scss'
import moment from 'moment/moment'

import { Col, Row, Icon, Form, Input, Button, Dropdown, Breadcrumb, Modal, Menu, Checkbox, Alert, Message, InputNumber, Notification } from 'antd'
const FormItem = Form.Item
const MIN_VALUE_DEPOSIT = 1

let SHA3 = require('crypto-js/sha3')
let sha3 = (value) => {
  return SHA3(value, {
    outputLength: 256
  }).toString()
}

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

    console.log('Min NTF Amount', this.props.getMinNtfAmount())
    this.setState({
      minNtfAmount: this.props.getMinNtfAmount()
    })

    console.log('Lock Duration', this.props.getLockDuration())
    this.setState({
      lockDuration: this.props.getLockDuration()
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

    console.log('UnlockTime', this.props.getUnlockTime())
    this.setState({
      unlockTime: this.props.getUnlockTime()
    })

    console.log('isWithdrawable', this.props.isWithdrawable())
    this.setState({
      isWithdrawable: this.props.isWithdrawable()
    })
  }

  validValue (value) {
    var deciPart = (value + '.').split('.')[1]
    //   console.log(deciPart)
    if (deciPart.length > 2) { return value.toFixed(2) } else { return value };
  }

  getStatus (status) {
    switch (status) {
      case 0:
        return 'NOT JOINED'
      case 1:
        return 'JOINED'
      case 2:
        return 'NOT JOINED'
      case 3:
        return 'NOT JOINED'
      case 127:
        return 'BANNED'
      default :
        return 'UNKNOWN'
    }
  }

  isJoinable () {
    var status = this.state.status
    var amount = this.state.depositedBalance
    var minAmount = this.state.minNtfAmount
    return (status != 1) && (status != 127) && (amount >= minAmount)
  }

  isLeaveable (status) {
    var status = this.state.status
    return (status == 1)
  }

  getUnlockTime (unlockTime) {
    return unlockTime
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

  isChecksumAddress (address) {
    // Check each case
    address = address.replace('0x', '')
    let addressHash = sha3(address.toLowerCase())

    for (let i = 0; i < 40; i++) {
      // The nth letter should be uppercase if the nth digit of casemap is 1
      if ((parseInt(addressHash[i], 16) > 7 && address[i].toUpperCase() !== address[i]) ||
                (parseInt(addressHash[i], 16) <= 7 && address[i].toLowerCase() !== address[i])) {
        return false
      }
    }
    return true
  };

  isWalletAddress (address) {
    if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
      // check if it has the basic requirements of an address
      return false
    } else if (/^(0x)?[0-9a-f]{40}$/.test(address) || /^(0x)?[0-9A-F]{40}$/.test(address)) {
      // If it's all small caps or all all caps, return true
      return true
    } else {
      // Otherwise check each case
      return this.isChecksumAddress(address)
    }
  }

  onCoinbaseChange (e) {
    // console.log(this.isWalletAddress(e.target.value))
    if (!this.isWalletAddress(e.target.value)) {
      this.setState({
        coinbaseError: 'invalid coinbase'
      })
    } else {
      this.setState({
        coinbaseError: null
      })
    }

    this.setState({
      coinbaseInput: e.target.value,
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
          <h3 className="text-center">Management</h3>
          <div className="ant-col-md-18 ant-col-md-offset-3 text-alert" style={{ 'textAlign': 'left' }}>
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
              <Col span={18} style={{ color: ((this.state.depositedBalance < this.state.minNtfAmount) ? 'red' : 'blue') }}>
                {parseFloat(this.state.depositedBalance).toFixed(2)} NTF
              </Col>
            </Row>

            <Row style={{ 'marginTop': '15px' }}>
              <Col span={6}>
                            Minimum to join:
              </Col>
              <Col xs={24} sm={24} md={24} lg={0} xl={0}/>
              <Col span={18}>
                {parseFloat(this.state.minNtfAmount).toFixed(2)} NTF
              </Col>
            </Row>

            <Row style={{ 'marginTop': '15px' }}>
              <Col span={6}>
                            Status:
              </Col>
              <Col xs={24} sm={24} md={24} lg={0} xl={0}/>
              <Col span={18}>
                {this.getStatus(this.state.status)}
              </Col>
            </Row>

            <hr />

            {!this.isLeaveable() &&
                    <div>
                      <Row style={{ 'marginTop': '15px' }}>
                        <Col span={6}>
                            Coinbase:
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={0} xl={0}/>
                        <Col span={18}>
                          <Input
                            className= "defaultWidth"
                            defaultValue= {''}
                            value= {this.state.coinbaseInput}
                            onChange= {this.onCoinbaseChange.bind(this)}
                          />
                        </Col>
                      </Row>
                      <Row style={{ 'marginTop': '15px' }}>
                        <Col xs={0} sm={0} md={7} lg={8} xl={8}/>
                        <Col xs={24} sm={24} md={10} lg={8} xl={8} className="content-center">
                          <Button disabled={!this.isJoinable()} onClick={this.confirm.bind(this)} type="primary" className="btn-margin-top submit-button">Join</Button>
                        </Col>
                      </Row>
                    </div>
            }

            {this.isLeaveable() &&
                    <Row style={{ 'marginTop': '15px' }}>
                      <Col xs={0} sm={0} md={7} lg={8} xl={8}/>
                      <Col xs={24} sm={24} md={10} lg={8} xl={8} className="content-center">
                        <Button onClick={this.confirm.bind(this)} type="primary" className="btn-margin-top submit-button">Leave</Button>
                      </Col>
                    </Row>
            }
          </div>
        </div>
      </div>

    )
  }

  ord_renderBreadcrumb () {
    return (
      <Breadcrumb style={{ 'marginLeft': '16px', 'marginTop': '16px', float: 'right' }}>
        <Breadcrumb.Item><Link to="/dashboard"><Icon type="home" /> Home</Link></Breadcrumb.Item>
        <Breadcrumb.Item> Management </Breadcrumb.Item>
      </Breadcrumb>
    )
  }

  confirm () {
    var error = false

    if (this.state.coinbaseError) {
      Notification.error({
        message: this.state.coinbaseError
      })
      error = true
    }

    if (error) return false

    var isJoinable = this.isJoinable()
    var joiningLabel = 'Lock duration after leaving:'
    var leavingLabel = 'Lock duration:'
    var label = isJoinable ? joiningLabel : leavingLabel
    this.setState({
      txhash: 'Creating',
      submitted: true
    })

    const content = (
      <div>
        <div>
                    Amount: {this.state.depositedBalance} NTF
        </div>
        <div>
          {label} {this.state.lockDuration} seconds
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
        this.onConfirm()
      },
      onCancel () {
      }
    })
  }

  failedTx (self, event) {
    if (self.state.tx_success) return
    this.setState({
      isLoading: false,
      txhash: null
    })
    event.stopWatching()
    // self.loadData();
    Notification.error({
      message: 'Smart contract rejected this coinbase address!',
      description: ''
    })
  }

  onConfirm () {
    this.setState({
      tx_success: false,
      isLoading: true
    })

    var isJoinable = this.isJoinable()
    var params = isJoinable ? [this.state.coinbaseInput] : []
    var functionName = isJoinable ? 'join' : 'leave'
    var eventName = isJoinable ? 'Joined' : 'Left'
    var self = this
    this.props.callFunction(functionName, params).then((result) => {
      console.log(self.props.getTransaction(result))
      if (!result) {
        Notification.error({
          message: 'revert'
        })
      }

      var event = isJoinable ? self.props.getEventJoined() : self.props.getEventLeft()
      event.watch(function (err, response) {
        console.log(err)
        if (response.event == eventName) {
          self.setState({
            tx_success: true,
            isLoading: false
          })
          self.loadData()
          Notification.success({
            message: eventName + ' success',
            description: eventName + ' successfully!'
          })
          event.stopWatching()
        }
      },
      setTimeout(() => self.failedTx(self, event), 10000)
      )
      Message.success('Transaction has been sent successfully!')
      self.setState({
        txhash: result,
        submitted: false
      })
    })
    return true
  }

  validate () {
    return true
    // return errorFields.join(", "); //+ " is required.";
  }
}
