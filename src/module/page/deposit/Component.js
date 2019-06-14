import React from 'react' // eslint-disable-line
import LoggedInPage from '../LoggedInPage'
import Footer from '@/module/layout/Footer/Container' // eslint-disable-line
import Tx from 'ethereumjs-tx' // eslint-disable-line
import { Link } from 'react-router-dom' // eslint-disable-line
import './style.scss'
import { WEB3 } from '@/constant'

import { Col, Row, Icon, Form, Button, Modal, Alert, Message, InputNumber, notification } from 'antd' // eslint-disable-line
const MIN_VALUE_DEPOSIT = 1

Message.config({
  top: 100
})

export default class extends LoggedInPage {
  componentDidMount () {
    this.loadData()
  }

  loadData () {
    this.props.getAllowance()
    this.props.getCoinbase()
    this.props.getStatus()
    this.props.getDepositedBalance()

    this.setState({
      walletAddress: this.props.currentAddress
    })

    this.setState({
      balance: this.props.getTokenBalance(this.props.currentAddress)
    })
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
            <h3 className="title">NTF Deposit</h3>
          </Row>
          {this.state.txhash && <div>
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
                <span className="text-left">Amount:</span>
              </Col>
              <Col md={16} xs={24}>
                <div className="input-right">
                  <InputNumber className="defaultWidth"
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
                  <Button onClick={this.confirm.bind(this)} type="ebp">Submit</Button>
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

  approveByMetamask(amount) {
    var toAddress = WEB3.PAGE['NextyManager'].ADDRESS
    var self = this

    this.props.contract.NTFToken.methods.approve(toAddress, web3.toWei(amount, 'ether')).send({from: this.props.currentAddress}).then((result) => {
      console.log('result', result)
    }).catch((error) => {
      Message.error('Call smart contract error')
    })

    var event = self.props.getEventApproval()
    event.watch(function (err, response) {
    if ((!err) && (response.event === 'Approval')) { // add require
        self.setState({
          allowance: self.props.allowance + amount
        })
        event.stopWatching()
        self.deposit(self.state.amount)
      }
    })
  }

  async approve (amount) {
    var self = this

    if (this.props.loginMetamask) {
      return this.approveByMetamask(amount)
    }

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
        if ((!err) && (response.event === 'Approval')) { // add require
          self.setState({
            allowance: self.props.allowance + amount
          })
          event.stopWatching()
          self.deposit(self.state.amount)
        }
      })
    })
  }

  depositByMetamask(amount) {
    const self = this
    this.props.contract.NextyManager.methods.deposit(web3.toWei(amount, 'ether')).send({from: this.props.currentAddress}).then((result) => {
      Message.success('Transaction has been sent successfully!')
      self.setState({
        txhash: result,
        amount: '',
        submitted: false
      })
    }).catch((error) => {
      Message.error('Call smart contract error')
    })

    var event = self.props.getEventDeposited()
    event.watch(function (err, response) {
      if ((!err) && (response.event === 'Deposited')) {
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
  }

  deposit (amount) {
    var self = this

    if (this.props.loginMetamask) {
      return this.depositByMetamask(amount)
    }

    this.props.deposit(amount).then((result) => {
      if (!result) {
        Message.error('Cannot send transaction!')
      }

      var event = self.props.getEventDeposited()
      event.watch(function (err, response) {
        if ((!err) && (response.event === 'Deposited')) {
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

    var toApprove = this.state.amount - this.props.allowance
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
    if (errorFields.length === 0) return null
    return (
      <div>
        {errorFields}
      </div>
    )
    // return errorFields.join(", "); //+ " is required.";
  }
}
