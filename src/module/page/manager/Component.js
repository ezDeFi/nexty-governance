import React from 'react' // eslint-disable-line
import LoggedInPage from '../LoggedInPage'
import { Link } from 'react-router-dom' // eslint-disable-line
import './style.scss'

import { Col, Row, Icon, Input, Button, Breadcrumb, Modal, Alert, Message, Notification } from 'antd' // eslint-disable-line

let SHA3 = require('crypto-js/sha3')
let sha3 = (value) => {
  return SHA3(value, {
    outputLength: 256
  }).toString()
}

Message.config({
  top: 100
})

export default class extends LoggedInPage {

  state = {
    coinbaseInput: sessionStorage.getItem('signerAddress')
  }

  componentDidMount () {
    this.loadData()
  }

  loadData () {
    this.props.getStatus()
    this.props.getDepositedBalance()
    this.props.getMinNtfAmount()
    this.props.getStakeLockHeight()
    this.props.getTokenBalance(this.props.currentAddress)

    this.setState({
      walletAddress: this.props.currentAddress
    })
  }

  validValue (value) {
    var deciPart = (value + '.').split('.')[1]
    //   console.log(deciPart)
    if (deciPart.length > 2) { return value.toFixed(2) } else { return value }
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
    var status = this.props.managerStatus
    var amount = this.props.depositedBalance
    var minAmount = this.props.minNtfAmount
    return (status !== 1) && (status !== 127) && (amount >= minAmount)
  }

  isLeaveable (status) {
    var status = this.props.managerStatus
    return (status === 1)
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

  ord_renderContent () { // eslint-disable-line
    const self = this
    let alerts = []
    if (this.state.submitted) {
      const error = self.validate()
      if (error) {
        alerts.push(<Alert message={error} type="error" showIcon />)
      }
    }

    let txhash = null // eslint-disable-line
    if (this.state.txhash) {
      const message = 'Transaction hash: ' + this.state.txhash
      txhash = <Alert description={message} type="success" showIcon />
    }

    const coinbaseInput = sessionStorage.getItem('signerAddress')
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
                {parseFloat(this.props.tokenBalance)/1e18} NTF
              </Col>
            </Row>

            <Row style={{ 'marginTop': '15px' }}>
              <Col span={6}>
                            Deposited:
              </Col>
              <Col xs={24} sm={24} md={24} lg={0} xl={0}/>
              <Col span={18} style={{ color: ((this.props.depositedBalance < this.props.minNtfAmount) ? 'red' : 'blue') }}>
                {parseFloat(this.props.depositedBalance)/1e18} NTF
              </Col>
            </Row>

            <Row style={{ 'marginTop': '15px' }}>
              <Col span={6}>
                            Minimum to join:
              </Col>
              <Col xs={24} sm={24} md={24} lg={0} xl={0}/>
              <Col span={18}>
                {parseFloat(this.props.minNtfAmount)/1e18} NTF
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

            <hr />

            {!this.isLeaveable() &&
                    <div>
                      <Row style={{ 'marginTop': '15px' }}>
                        <Col span={6}>
                            Signer address:
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={0} xl={0}/>
                        <Col span={18}>
                          <Input
                            className= "defaultWidth"
                            defaultValue={coinbaseInput}
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

  ord_renderBreadcrumb () { // eslint-disable-line
    return (
      <Breadcrumb style={{ 'marginLeft': '16px', 'marginTop': '16px', float: 'right' }}>
        <Breadcrumb.Item><Link to="/dashboard"><Icon type="home" /> Home</Link></Breadcrumb.Item>
        <Breadcrumb.Item> Management </Breadcrumb.Item>
      </Breadcrumb>
    )
  }

  pad(num) {
    return ("0" + num).slice(-2)
  }

  convertHhmmss(secs) {
    let minutes = Math.floor(secs / 60)
    secs = secs % 60
    const hours = Math.floor(minutes / 60)
    minutes = minutes % 60
    return `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(secs)}`
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
          Amount: {this.props.depositedBalance / 1e18} NTF
        </div>
        <div>
          {label} {this.convertHhmmss(this.props.stakeLockHeight * 2)}
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

  joinByMetamask() {
    var self = this
    var eventName = 'Joined'
    this.props.contract.NextyManager.methods.join(this.state.coinbaseInput).send({from: this.props.currentAddress}).then((result) => {
      Message.success('Transaction has been sent successfully!')
      self.setState({
        isLoading: false
      })
      self.loadData()
      sessionStorage.setItem('signerAddress', this.state.coinbaseInput)
    }).catch((error) => {
      Message.error('Call smart contract error')
    })
  }

  leaveByMetamask() {
    var self = this
    var eventName = 'Left'
    this.props.contract.NextyManager.methods.leave().send({from: this.props.currentAddress}).then((result) => {
      Message.success('Transaction has been sent successfully!')
      self.setState({
        isLoading: false
      })
      self.loadData()
    }).catch((error) => {
      Message.error('Call smart contract error')
    })
  }

  onConfirm () {
    var isJoinable = this.isJoinable()
    var params = isJoinable ? [this.state.coinbaseInput] : []
    var functionName = isJoinable ? 'join' : 'leave'
    var eventName = isJoinable ? 'Joined' : 'Left'
    this.setState({
      isLoading: true
    })
    var self = this

    if (this.props.loginMetamask) {
      if (isJoinable) {
        return this.joinByMetamask()
      } else {
        return this.leaveByMetamask()
      }
    }

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
        if (response.event === eventName) {
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
