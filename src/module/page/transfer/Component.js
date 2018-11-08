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
    this.setState({
      addressError: true
    })
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

  onToAddressChange (e) {
    // console.log(this.isWalletAddress(e.target.value))
    if (!this.isWalletAddress(e.target.value)) {
      this.setState({
        addressError: true
      })
    } else {
      this.setState({
        addressError: null
      })
    }

    this.setState({
      toAddress: e.target.value,
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
          <h3 className="text-center">NTF Transfer</h3>
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
                            To address:
              </Col>
              <Col xs={24} sm={24} md={24} lg={0} xl={0}/>
              <Col span={18}>
                <Input
                  className= "defaultWidth"
                  defaultValue= {''}
                  value= {this.state.toAddress}
                  onChange= {this.onToAddressChange.bind(this)}
                />
              </Col>
            </Row>

            <Row style={{ 'marginTop': '15px' }}>
              <Col span={6}>
                            Amount:
              </Col>
              <Col xs={24} sm={24} md={24} lg={0} xl={0}/>
              <Col span={18}>

                <InputNumber
                  className="defaultWidth"
                  defaultValue={0}
                  value={this.state.amount}
                  onChange={this.onAmountChange.bind(this)}
                />
              </Col>
            </Row>

            <Row style={{ 'marginTop': '15px' }}>
              <Col xs={0} sm={0} md={7} lg={8} xl={8}/>
              <Col xs={24} sm={24} md={10} lg={8} xl={8} className="content-center">
                <Button onClick={this.confirm.bind(this)} type="primary" className="btn-margin-top submit-button">Send</Button>
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
        <Breadcrumb.Item> Transfer</Breadcrumb.Item>
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
    // const _package = this.state.package;
    // const package_timestamp = parseInt(_package) * 24 * 60 * 60 * 1000;
    // const expire_timestamp = new Date().getTime() + package_timestamp + 7 * 24 * 60 * 60 * 1000;
    // const expire_date = new Date(expire_timestamp);
    // const expire_date_default_format= moment.utc(expire_date).format('DD/MM/YYYY') ;
    //    const expire_month = expire_date.getMonth() + 1;
    //    const expire_day = expire_date.getDate();
    //    const expire_year = expire_date.getFullYear();

    const content = (
      <div>
        <div>
                    Amount: {this.state.amount} NTF
        </div>
        <div>
                    To: {this.state.toAddress}
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

  onConfirm () {
    this.setState({
      isLoading: true,
      txhash: 'Creating'
    })

    const self = this
    this.props.transfer(self.state.toAddress, self.state.amount).then((result) => {
      if (!result) {
        Message.error('Cannot send transaction!')
      }

      var event = self.props.getEventTransfer()
      event.watch(function (err, response) {
        if (response.event == 'Transfer') {
          self.setState({
            tx_success: true,
            isLoading: false
          })
          self.loadData()
          notification.success({
            message: 'Transfered success',
            description: 'Transfered successfully!'
          })
          event.stopWatching()
        }
      })

      Message.success('Transaction has been sent successfully!')
      self.setState({
        txhash: result,
        amount: '',
        toAddress: '',
        submitted: false
      })
    })
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
    if (this.state.addressError) {
      errorFields.push(<p className="alert-no-padding">Invalid Address</p>)
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
