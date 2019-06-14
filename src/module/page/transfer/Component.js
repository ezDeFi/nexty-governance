import React from 'react' // eslint-disable-line
import LoggedInPage from '../LoggedInPage'
import Tx from 'ethereumjs-tx' // eslint-disable-line
import { Link } from 'react-router-dom' // eslint-disable-line
import './style.scss'
import moment from 'moment/moment' // eslint-disable-line

import { Col, Row, Icon, Form, Input, Button, Modal, Alert, Message, InputNumber, notification } from 'antd' // eslint-disable-line
const MIN_VALUE_DEPOSIT = 1

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
  componentDidMount () {
    this.setState({
      addressError: true
    })
    this.loadData()
  }

  loadData () {
    this.props.getTokenBalance(this.props.currentAddress)
    this.props.getDepositedBalance()
    this.props.getStatus()
    this.props.getCoinbase()
    this.props.getAllowance()
  }

  validValue (value) {
    var deciPart = (value + '.').split('.')[1]
    //   console.log(deciPart)
    if (deciPart.length > 2) { return value.toFixed(2) } else { return value }
  }

  onAmountChange (value) {
    if (this.props.tokenBalance < value) {
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

  ord_renderContent () { // eslint-disable-line
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

    let txhash = null // eslint-disable-line
    if (this.state.txhash) {
      const message = 'Transaction hash: ' + this.state.txhash
      txhash = <Alert description={message} type="success" showIcon />
    }

    // const valid = this.state.package && this.state.amount && (alerts.length == 0);
    // if(valid) {
    //     alerts = [];
    // }

    return (
        <div className="page-common">
          <Row>
            <h3 className="title">NTF Transfer</h3>
          </Row>
          {this.state.txhash && <div>
              <Row>
                {alerts}
              </Row>
              <Row>
                <Col md={8} xs={8}>
                  <span className="text-left">TxHash:</span>
                </Col>
                <Col md={16} xs={16}>
                  <div>
                    {this.state.txhash} {this.state.isLoading ? <img src='/assets/images/Loading.gif' style = {{ 'width': '20px' }} />
                      : <Icon type="check" style={{ fontSize: 24, color: '#4CAF50' }}/>}
                  </div>
                </Col>
              </Row>
          </div>}
          <div>
            <Row>
              <Col md={8} xs={8}>
                <span className="text-left">Balance:</span>
              </Col>
              <Col md={16} xs={16}>
                <div className="text-right">{this.props.tokenBalance} NTF</div>
              </Col>
            </Row>
            <Row>
              <Col md={8} xs={8}>
                <span className="text-left">Deposited:</span>
              </Col>
              <Col md={16} xs={16}>
                <div className="text-right">{this.props.depositedBalance} NTF</div>
              </Col>
            </Row>
            <Row>
              <Col md={8} xs={24}>
                <span className="text-left">To address:</span>
              </Col>
              <Col md={16} xs={24}>
                <div>
                  <Input
                    className= "defaultWidth"
                    defaultValue= {''}
                    value= {this.state.toAddress}
                    onChange= {this.onToAddressChange.bind(this)}
                  />
                </div>
              </Col>
            </Row>
            <Row>
              <Col md={8} xs={24}>
                <span className="text-left">Amount:</span>
              </Col>
              <Col md={16} xs={24}>
                <div>
                  <InputNumber
                    className="defaultWidth"
                    defaultValue={0}
                    value={this.state.amount}
                    onChange={this.onAmountChange.bind(this)}
                  />
                </div>
              </Col>
            </Row>
            <Row>
              <Col md={8} xs={8}>
                <span className="text-left"></span>
              </Col>
              <Col md={16} xs={16}>
                <div className="">
                  <Button onClick={this.confirm.bind(this)} type="ebp">Send</Button>
                </div>
              </Col>
            </Row>
          </div>
        </div>
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

  transferByMetamask() {
    const self = this
    this.props.contract.NTFToken.methods.transfer(self.state.toAddress, web3.toWei(self.state.amount, 'ether')).send({from: this.props.currentAddress}).then((result) => {

      Message.success('Transaction has been sent successfully!')
      self.setState({
        txhash: result,
        amount: '',
        toAddress: '',
        submitted: false
      })
    }).catch((error) => {
      Message.error('Call smart contract error')
    })

    var event = self.props.getEventTransfer()
    event.watch(function (err, response) {
      if ((!err) && (response.event === 'Transfer')) {
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
  }

  onConfirm () {
    this.setState({
      isLoading: true,
      txhash: 'Creating'
    })

    if (this.props.loginMetamask) {
      return this.transferByMetamask()
    }

    const self = this
    this.props.transfer(self.state.toAddress, self.state.amount).then((result) => {
      if (!result) {
        Message.error('Cannot send transaction!')
      }

      var event = self.props.getEventTransfer()
      event.watch(function (err, response) {
        if ((!err) && (response.event === 'Transfer')) {
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
    if (errorFields.length === 0) return null
    return (
      <div>
        {errorFields}
      </div>
    )
    // return errorFields.join(", "); //+ " is required.";
  }
}
