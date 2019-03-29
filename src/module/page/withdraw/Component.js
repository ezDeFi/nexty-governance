import React from 'react' // eslint-disable-line
import LoggedInPage from '../LoggedInPage'
import Footer from '@/module/layout/Footer/Container' // eslint-disable-line
import Tx from 'ethereumjs-tx' // eslint-disable-line
import { Link } from 'react-router-dom' // eslint-disable-line
import './style.scss'
import moment from 'moment/moment'

import { Col, Row, Icon, Form, Button, Breadcrumb, Modal, Alert, Message, notification } from 'antd' // eslint-disable-line

Message.config({
  top: 100
})

export default class extends LoggedInPage {
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
        <div className="ebp-header-divider">

        </div>
        <div className="ebp-page">
          <h3 className="text-center">NTF Withdraw</h3>
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
                            Balance:
              </Col>
              <Col xs={24} sm={24} md={24} lg={0} xl={0}/>
              <Col span={18}>
                {this.props.tokenBalance} NTF
              </Col>
            </Row>

            <Row style={{ 'marginTop': '15px' }}>
              <Col span={6}>
                            Deposited:
              </Col>
              <Col xs={24} sm={24} md={24} lg={0} xl={0}/>
              <Col span={18} style={{ color: 'red' }}>
                {this.props.depositedBalance} NTF
              </Col>
            </Row>

            {!this.props.isWithdrawable &&
                    <div>
                      <Row style={{ 'marginTop': '15px' }}>
                        <Col span={6}>
                            Status:
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={0} xl={0}/>
                        <Col span={18}>
                          {this.getStatus(this.props.managerStatus)}
                        </Col>
                      </Row>

                      <Row style={{ 'marginTop': '15px', 'color': 'red' }}>
                        Unwithdrawable
                      </Row>
                      {(this.props.managerStatus !== 1) &&
                    <Row style={{ 'marginTop': '15px' }}>
                      <Col span={6}>
                            UnlockTime:
                      </Col>
                      <Col xs={24} sm={24} md={24} lg={0} xl={0}/>
                      <Col span={18}>
                        {this.getUnlockTime(this.props.unlockTime)}
                      </Col>
                    </Row>
                      }
                    </div>
            }

            {Boolean(this.props.isWithdrawable) &&
                    <div>
                      <Row style={{ 'marginTop': '15px' }}>
                        <Col xs={0} sm={0} md={7} lg={8} xl={8}/>
                        <Col xs={24} sm={24} md={10} lg={8} xl={8} className="content-center">
                          <Button onClick={this.confirm.bind(this)} type="primary" className="btn-margin-top submit-button">Withdraw</Button>
                        </Col>
                      </Row>
                    </div>
            }
          </div>
        </div>
      </div>
    )
  }

  ord_renderBreadcrumb () { // eslint-disable-line
    return (
      <Breadcrumb style={{ 'marginLeft': '16px', 'marginTop': '16px', float: 'right' }}>
        <Breadcrumb.Item><Link to="/manage"><Icon type="home" /> Home</Link></Breadcrumb.Item>
        <Breadcrumb.Item>Withdraw</Breadcrumb.Item>
      </Breadcrumb>
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
