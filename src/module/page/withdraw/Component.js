import React from 'react' // eslint-disable-line
import StandardPage from '../StandardPage'
import Footer from '@/module/layout/Footer/Container' // eslint-disable-line
import Tx from 'ethereumjs-tx' // eslint-disable-line
import { Link } from 'react-router-dom' // eslint-disable-line
import './style.scss'
import moment from 'moment/moment'

import { Col, Row, Icon, Form, Button, Modal, Alert, Message, notification } from 'antd' // eslint-disable-line

Message.config({
  top: 100
})

export default class extends StandardPage {
  componentDidMount () {
    this.loadData()
  }

  loadData () {
    this.props.isWithdrawable()
    this.props.getTokenBalance(this.props.currentAddress)
    this.props.getDepositedBalance()
    this.props.getStatus()
    this.props.getCoinbase()
    this.props.getAllowance()
    this.props.getUnlockTime()
    this.props.isWithdrawable()

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
        return 'PENDING ACTIVE'
      case 1:
        return 'ACTIVE'
      case 2:
        return 'PENDING WITHDRAW'
      case 3:
        return 'WITHDRAWN'
      case 127:
        return 'BANNED'
      default :
        return 'UNKNOWN'
    }
  }

  getUnlockTime (unlockTime) {
    return moment(unlockTime).format('MMMM Do YYYY, h:mm:ss a')
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
      <div className="">
        <div className="page-common">
          <Row>
            <h3 className="title">NTF Withdraw</h3>
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
            {!this.props.isWithdrawable &&
              <div>
                <Row>
                  <Col md={8} xs={8}>
                    <span className="text-left">Status:</span>
                  </Col>
                  <Col md={16} xs={16}>
                    <div className="text-right">{this.getStatus(this.props.managerStatus)}</div>
                  </Col>
                </Row>
                <Row>
                  <Col md={8} xs={8}>
                    <span className="text-left"></span>
                  </Col>
                  <Col md={16} xs={16}>
                    <div className="text-right"><span style={{ 'marginTop': '10px', 'color': 'red' }}>
                        Unwithdrawable
                    </span></div>
                  </Col>
                </Row>
                {(this.props.managerStatus !== 1) &&
                  <Row>
                    <Col md={8} xs={8}>
                      <span className="text-left">UnlockTime:</span>
                    </Col>
                    <Col md={16} xs={16}>
                      <div className="text-right">{this.getUnlockTime(this.props.unlockTime)}</div>
                    </Col>
                  </Row>
                }
              </div>
            }

            {Boolean(this.props.isWithdrawable) &&
              <div>
                <Row>
                  <Col md={8} xs={8}>
                    <span className="text-left"></span>
                  </Col>
                  <Col md={16} xs={16}>
                    <div className="">
                      <Button onClick={this.confirm.bind(this)} type="ebp">Withdraw</Button>
                    </div>
                  </Col>
                </Row>
              </div>
            }
          </div>
        </div>
      </div>
    )
  }

  confirm () {
    this.setState({
      submitted: true
    })

    const content = (
      <div>
        <div>
          Amount: {this.props.depositedBalance} NTF
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

  withdrawByMetamask() {
    var self = this
    this.props.contract.NextyManager.methods.withdraw().send({from: this.props.currentAddress}).then((result) => {
      Message.success('Transaction has been sent successfully!')
      self.setState({
        txhash: result,
        submitted: false
      })
    }).catch((error) => {
      Message.error('Call smart contract error')
    })

    var event = self.props.getEventWithdrawn()
    event.watch(function (err, response) {
      if ((!err) && (response.event === 'Withdrawn')) {
        self.setState({
          tx_success: true,
          isLoading: false
        })
        self.loadData()
        notification.success({
          message: 'Withdrawn success',
          description: 'Withdrawn successfully!'
        })
        event.stopWatching()
      }
    })
  }

  withdraw () {
    if (this.props.loginMetamask) {
      return this.withdrawByMetamask()
    }

    var self = this
    this.props.withdraw().then((result) => {
      if (!result) {
        Message.error('Cannot send transaction!')
      }

      var event = self.props.getEventWithdrawn()
      event.watch(function (err, response) {
        if ((!err) && (response.event === 'Withdrawn')) {
          self.setState({
            tx_success: true,
            isLoading: false
          })
          self.loadData()
          notification.success({
            message: 'Withdrawn success',
            description: 'Withdrawn successfully!'
          })
          event.stopWatching()
        }
      })

      Message.success('Transaction has been sent successfully!')
      self.setState({
        txhash: result,
        submitted: false
      })
    })
  }

  onConfirm () {
    this.setState({
      isLoading: true
    })

    this.withdraw()
    return true
  }

  validate () {
    return true
    // return errorFields.join(", "); //+ " is required.";
  }
}
