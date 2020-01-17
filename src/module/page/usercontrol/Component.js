import React from 'react' // eslint-disable-line
import StandardPage from '../StandardPage'
import Footer from '@/module/layout/Footer/Container' // eslint-disable-line
import Tx from 'ethereumjs-tx' // eslint-disable-line
import { Link } from 'react-router-dom' // eslint-disable-line
import { cutString } from '@/service/Help'
import moment from 'moment'
import URI from 'urijs'
import { getStatusText } from '@/util'

import './style.scss'

import { Col, Row, Icon, InputNumber, Button, Select } from 'antd' // eslint-disable-line
import { min } from 'bn.js'
var BigNumber = require('bignumber.js')
BigNumber.config({ ERRORS: false })
const Option = Select.Option

const weiToEther = (wei) => {
  return (Number(wei) / 1e18).toFixed(4)
}

const toTime = (value) => {
  var dateString = moment.unix(value).format('DD/MM/YYYY')
  return dateString
}

const timeToString = (_sec) => {
  var sec = Number(_sec)
  var seconds = sec % 60
  var minutes = Math.floor(sec / 60)
  var hour = Math.floor(minutes / 60)
  var day = Math.floor(hour / 24)
  hour = hour % 24
  minutes = minutes % 60
  var s = ''
  if (day > 0) s = s + day + ' day(s) '
  if (hour > 0) s = s + hour + ' hour(s) '
  if (minutes > 0) s = s + minutes + ' minute(s) '
  if (seconds > 0) s = s + seconds + ' second(s)'
  return s
}

export default class extends StandardPage {
  constructor (props) {
    super(props)
    const params = new URI(window.location.href || '').search(true)
    sessionStorage.setItem('pool_id', params.id)
    this.state = {
      listeningApprove: false
    }
    props.selectPool(params.id)
  }

  componentDidMount () {
    this.loadData()
    // this.props.listenToDeposit()
  }

  componentWillUnmount () {
    sessionStorage.removeItem('pool_id')
  }

  loadData () {
    this.props.reload()
    // this.props.getBalance()
    // this.props.getTokenBalance(this.props.currentAddress)
    // this.props.getDepositedBalance()
    // this.props.getStatus()
    // this.props.getCoinbase()
    // this.props.getAllowance()
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

  handleChange (value) {
    console.log(`selected ${value}`)
    this.props.selectPool(value)
  }

  poolsRender () {
    let source = this.props.pools ? this.props.pools : []
    return (
      <Row>
        <Col md={8} xs={8}>
          <span className="text-left">SelectedPool: {this.props.logo && <img width={24} height={24} src={this.props.logo} />}</span>
        </Col>
        <Col md={16} xs={16}>
          <div className="">
            <Select defaultValue={this.props.selectedPool} className ='maxWidth' onChange={this.handleChange.bind(this)}>
              {Object.keys(source).length > 0 && Object.values(source).map((d, key) => (
                <Option key={key} value={d}>{this.props.getName(d)} - {cutString(d)}</Option>
              ))}
            </Select>
          </div>
        </Col>
      </Row>
    )
  }

  ord_renderContent () { // eslint-disable-line
    let status = getStatusText(this.props.poolStatus, weiToEther(this.props.poolNtfBalance))
    if (this.props.poolStatus === undefined || this.props.poolNtfBalance === undefined) {
      status = 'Loading'
    }
    const color = (status === 'Waiting for Stakes' || status === 'Leaked') ? 'red' : (status === 'Not Joined' ? 'orange' : 'green')
    return (
      <div className="page-common">
        <Row>
          <h3 className="title">Private Informations</h3>
        </Row>
        <div style={{ 'textAlign': 'left' }}>
          {/* {this.props.selectedPool && this.poolsRender()} */}
          {/*  <Row>
              <Col md={8} xs={8}>
                <span className="text-left">Coin Balance:</span>
              </Col>
              <Col md={16} xs={16}>
                <div className="text-right">
                  {weiToEther(this.props.balance)} NTY
                </div>
              </Col>
            </Row> */}
          <Row>
            <Col md={8} xs={8}>
              <span className="text-left">Balance:</span>
            </Col>
            <Col md={16} xs={16}>
              <div className="text-right">
                {weiToEther(this.props.myNtfBalance)} NTF
              </div>
            </Col>
          </Row>
          {/* <h3 className="title-section">Private Informations</h3> */}
          {this.props.selectedPool &&
              <Row>
                <Col md={8} xs={8}>
                  <span className="text-left">Deposited:</span>
                </Col>
                <Col md={16} xs={16}>
                  <div className="text-right">
                    {weiToEther(this.props.myNtfDeposited)} NTF
                  </div>
                </Col>
              </Row>
          }

          {Number(this.props.myPendingOutAmount) > 0 &&
          <div>
            <Row>
              <Col md={8} xs={8}>
                <span className="text-left">Pending out:</span>
              </Col>
              <Col md={16} xs={16}>
                <div className="text-right">
                  {weiToEther(this.props.myPendingOutAmount)} NTF
                </div>
              </Col>
            </Row>
            <Row>
              <Col md={8} xs={8}>
                <span className="text-left"></span>
              </Col>
              <Col md={16} xs={16}>
                {!this.props.isLocking && <Button onClick={this.withdraw.bind(this)} type="ebp">Withdraw</Button>}
              </Col>
            </Row>
          </div>
          }

          {Number(this.props.myPendingOutAmount) === 0 && (Number(this.props.myNtfDeposited) !== 0) &&
          <div>
            <Row>
              <Col md={8} xs={8}>
                <span className="text-left">Amount(NTF):</span>
              </Col>
              <Col md={16} xs={16}>
                <div className="">
                  <InputNumber
                    className = "maxWidth"
                    defaultValue={0}
                    value={this.state.requestOutAmount}
                    onChange={this.onRequestOutAmountChange.bind(this)}
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
                  <Button onClick={this.requestOut.bind(this)} type="ebp">Withdraw Request</Button>
                </div>
              </Col>
            </Row>
          </div>
          }

          {this.props.selectedPool && Number(this.props.myNtfDeposited) > 0 &&
              <Row>
                <Col md={8} xs={8}>
                  <span className="text-left">Status:</span>
                </Col>
                <Col md={16} xs={16}>
                  <div className="text-right">
                    {this.props.isLocking ? 'Locked' : 'Not locked'}
                  </div>
                </Col>
              </Row>
          }
          {this.props.selectedPool && this.props.isLocking &&
              <Row>
                <Col md={8} xs={8}>
                  <span className="text-left">UnlockTime:</span>
                </Col>
                <Col md={16} xs={16}>
                  <div className="text-right">
                    {toTime(this.props.myUnlockTime)}
                  </div>
                </Col>
              </Row>
          }
          {!this.props.selectedPool &&
              <Row>
                <Col md={8} xs={8}>
                  <span className="text-left"></span>
                </Col>
                <Col md={16} xs={16}>
                  <p>Not found any pool!</p>
                </Col>
              </Row>
          }
          {this.props.selectedPool &&
              <div>
                {Number(this.props.myRewardBalance) > 0 &&
                <div>
                  <Row>
                    <Col md={8} xs={8}>
                      <span className="text-left">Reward Balance:</span>
                    </Col>
                    <Col md={16} xs={16}>
                      <div className="text-right">
                        {weiToEther(this.props.myRewardBalance)} NTY
                      </div>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={8} xs={8}>
                    </Col>
                    <Col md={16} xs={16}>
                      <div className="">
                        <Button onClick={this.claim.bind(this)} type="ebp">Claim reward</Button>
                      </div>
                    </Col>
                  </Row>
                </div>
                }

                <h3 className="title-section">Current Pool's Informations</h3>
                <Row>
                  <Col md={8} xs={24}>
                    <span className="text-left">Pool's Name:</span>
                  </Col>
                  <Col md={16} xs={24}>
                    <div className="text-right">
                      {this.props.name}
                    </div>
                  </Col>
                </Row>

                <Row>
                  <Col md={8} xs={24}>
                    <span className="text-left">Pool's Owner:</span>
                  </Col>
                  <Col md={16} xs={24}>
                    <div className="text-right">
                      {this.props.owner}
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col md={8} xs={8}>
                    <span className="text-left">Pool's Website:</span>
                  </Col>
                  <Col md={16} xs={16}>
                    <div className="text-right">
                      <a href={this.props.website} target='_'>{this.props.website}</a>
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col md={8} xs={8}>
                    <span className="text-left">Pool's Location:</span>
                  </Col>
                  <Col md={16} xs={16}>
                    <div className="text-right">
                      {this.props.location}
                    </div>
                  </Col>
                </Row>

                <Row>
                  <Col md={8} xs={8}>
                    <span className="text-left">compRate:</span>
                  </Col>
                  <Col md={16} xs={16}>
                    <div className="text-right">
                      {this.props.compRate}
                    </div>
                  </Col>
                </Row>

                <Row>
                  <Col md={8} xs={8}>
                    <span className="text-left">Lock Duration:</span>
                  </Col>
                  <Col md={16} xs={16}>
                    <div className="text-right">
                      {timeToString(this.props.lockDuration)}
                    </div>
                  </Col>
                </Row>

                <Row>
                  <Col md={8} xs={8}>
                    <span className="text-left">Logo:</span>
                  </Col>
                  <Col md={16} xs={16}>
                    <div className="">
                      <img width={24} height={24} src={this.props.logo}
                      onError={(e)=>{e.target.onerror = null;
                      e.target.src="../../../assets/images/default-logo.png"}}/>
                    </div>
                  </Col>
                </Row>

                <Row>
                  <Col md={8} xs={8}>
                    <span className="text-left">Status:</span>
                  </Col>
                  <Col md={16} xs={16}>
                    <div className={ 'text-right ' + color}>
                      {status}
                    </div>
                  </Col>
                </Row>

                <Row>
                  <Col md={8} xs={8}>
                    <span className="text-left">Holding Ntf Balance:</span>
                  </Col>
                  <Col md={16} xs={16}>
                    <div className="text-right">
                      {weiToEther(Number(this.props.poolNtfBalance) + Number(this.props.poolNtfDeposited))} NTF
                    </div>
                  </Col>
                </Row>

                {/* <Row>
                  <Col md={8} xs={8}>
                    <span className="text-left">Pool Ntf Balance:</span>
                  </Col>
                  <Col md={16} xs={16}>
                    <div className="text-right">
                      {weiToEther(Number(this.props.poolNtfBalance))} NTF
                    </div>
                  </Col>
                </Row>

                <Row>
                  <Col md={8} xs={8}>
                    <span className="text-left">Pool Ntf Deposited:</span>
                  </Col>
                  <Col md={16} xs={16}>
                    <div className="text-right">
                      {weiToEther(Number(this.props.poolNtfDeposited))} NTF
                    </div>
                  </Col>
                </Row> */}

                <Row>
                  <Col md={8} xs={8}>
                    <span className="text-left">Holding Nty Balance:</span>
                  </Col>
                  <Col md={16} xs={16}>
                    <div className="text-right">
                      {weiToEther(this.props.poolNtyBalance)} NTY
                    </div>
                  </Col>
                </Row>

                <Row>
                  <Col md={8} xs={8}>
                    <span className="text-left">Amount(NTF):</span>
                  </Col>
                  <Col md={16} xs={16}>
                    <div className="">
                      <InputNumber
                        className = "maxWidth"
                        defaultValue={0}
                        value={this.state.depositAmount}
                        onChange={this.onDepositAmountChange.bind(this)}
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
                      <Button className= {this.props.depositing ? 'alertButton' : ''} disabled={this.props.depositing} onClick={this.deposit.bind(this)} type="ebp">Deposit</Button>
                    </div>
                  </Col>
                </Row>

                {/* <Row>
                  <Col md={8} xs={8}>
                    <span className="text-left">Amount(NTF):</span>
                  </Col>
                  <Col md={16} xs={16}>
                    <div className="">
                      <InputNumber
                        className = "maxWidth"
                        defaultValue={0}
                        value={this.state.requestOutAmount}
                        onChange={this.onRequestOutAmountChange.bind(this)}
                      />
                    </div>
                  </Col>
                </Row>

                <Row>
                  <Col md={8} xs={24}>
                    <span className="text-left"></span>
                  </Col>
                  <Col md={16} xs={24}>
                    <div className="">
                      <Button onClick={this.requestOut.bind(this)} type="ebp">Withdraw Request</Button>&nbsp;
                    </div>
                  </Col>
                </Row> */}
              </div>
          }
        </div>
      </div>
    )
  }

  onDepositAmountChange (value) {
    this.setState({
      depositAmount: value
    })
  }

  onRequestOutAmountChange (value) {
    this.setState({
      requestOutAmount: value
    })
  }

  async deposit () {
    if (!this.state.listeningApprove) {
      this.setState({
        listeningApprove: true
      })
      console.log('listening approval event')
      this.props.listenToDeposit()
    }
    this.props.depositProcess()
    let amount = BigNumber(this.state.depositAmount).times(BigNumber(10).pow(BigNumber(18))).toFixed(0)
    try {
      await this.props.approve(amount.toString())
      await this.props.deposit(amount.toString())
      // await this.props.approve(amount.toString())
    } catch (e) {
      console.log('canceled')
      this.props.depositStop()
    }
    // let approve = await this.props.approve(amount.toString())
    // if (approve === false) {
    //   console.log('canceled')
    // }
  }

  async withdraw () {
    await this.props.withdraw()
  }

  async requestOut () {
    let amount = BigNumber(this.state.requestOutAmount).times(BigNumber(10).pow(BigNumber(18))).toFixed(0)
    await this.props.requestOut(amount)
  }

  async claim () {
    await this.props.claim()
  }

  virtuellMining () {
    this.props.virtuellMining()
  }
}
