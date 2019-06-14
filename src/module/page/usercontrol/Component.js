import React from 'react' // eslint-disable-line
import StandardPage from '../StandardPage'
import Footer from '@/module/layout/Footer/Container' // eslint-disable-line
import Tx from 'ethereumjs-tx' // eslint-disable-line
import { Link } from 'react-router-dom' // eslint-disable-line
import { cutString } from '@/service/Help'
import moment from 'moment'

import './style.scss'

import { Col, Row, Icon, InputNumber, Button, Select } from 'antd' // eslint-disable-line
const Option = Select.Option

const weiToEther = (wei) => {
  return (Number(wei) / 1e18).toFixed(4)
}

const toTime = (value) => {
  var dateString = moment.unix(value).format('DD/MM/YYYY')
  return dateString
}

export default class extends StandardPage {
  componentDidMount () {
    this.loadData()
  }

  loadData () {
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
    console.log(`selected ${value}`);
    this.props.selectPool(value)
  }

  poolsRender () {
    let source = this.props.pools ? this.props.pools : []
    return (
      <Row style={{ 'marginTop': '15px' }}>
        <Col span={6}>
          SelectedPool: <img width={24} height={24} src={this.props.logo} />
        </Col>
        <Col xs={24} sm={24} md={24} lg={0} xl={0}/>
        <Col span={18}>
          <Select defaultValue={this.props.selectedPool} className ='maxWidth' onChange={this.handleChange.bind(this)}>
            {Object.keys(source).length > 0 && Object.values(source).map((d, key) => (
              <Option key={key} value={d}>{this.props.getName(d)} - {cutString(d)}</Option>
            ))}
          </Select>
        </Col>
      </Row>
    )
  }

  ord_renderContent () { // eslint-disable-line
    return (
        <div className="page-common">
          <Row>
            <h3 className="title">NTF Pools</h3>
          </Row>
          <div className="ant-col-md-18 ant-col-md-offset-3" style={{ 'textAlign': 'left' }}>
            {this.props.selectedPool && this.poolsRender()}
            <Row>
              <Col md={8} xs={8}>
                <span className="text-left">Coin Balance:</span>
              </Col>
              <Col md={16} xs={16}>
                <div className="text-right">
                  {weiToEther(this.props.balance)} NTY
                </div>
              </Col>
            </Row>
            <Row>
              <Col md={8} xs={8}>
                <span className="text-left">Token Balance:</span>
              </Col>
              <Col md={16} xs={16}>
                <div className="text-right">
                  {weiToEther(this.props.myNtfBalance)} NTF
                </div>
              </Col>
            </Row>
            <h3>Private Informations</h3>
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
            <hr />
            <Row style={{ 'marginTop': '15px' }}>
              <Col span={6}>
                Pending out:
              </Col>
              <Col span={6}>
                {weiToEther(this.props.myPendingOutAmount)} NTF
              </Col>
              {!this.props.isLocking &&
              <Col span={24} style={{ 'marginTop': '15px' }}>
                <Button onClick={this.withdraw.bind(this)} type="primary" className="btn-margin-top submit-button maxWidth">Withdraw</Button>
              </Col>
              }
            </Row>
            <hr />
            {this.props.selectedPool &&
            <Row style={{ 'marginTop': '15px' }}>
              <Col span={6}>
                Status:
              </Col>
              <Col xs={24} sm={24} md={24} lg={0} xl={0}/>
              <Col span={18}>
                {this.props.isLocking ? 'locked' : 'not locked'}
              </Col>
            </Row>
            }
            {this.props.selectedPool && this.props.isLocking &&
            <Row style={{ 'marginTop': '15px' }}>
              <Col span={6}>
                UnlockTime:
              </Col>
              <Col xs={24} sm={24} md={24} lg={0} xl={0}/>
              <Col span={18}>
                {toTime(this.props.myUnlockTime)}
              </Col>
            </Row>}
            {!this.props.selectedPool &&
              <p> Not found any pool!</p>
            }
            {this.props.selectedPool &&
            <div>
              <Row style={{ 'marginTop': '15px' }}>
                <Col span={6}>
                              Reward Balance:
                </Col>
                <Col span={18}>
                  {weiToEther(this.props.myRewardBalance)} NTY
                </Col>
                <Col span={24} style={{ 'marginTop': '15px' }}>
                  <Button onClick={this.claim.bind(this)} type="primary" className="btn-margin-top submit-button maxWidth">Claim reward</Button>
                </Col>
              </Row>

              <h3>Current Pool's Informations</h3>
              <Row style={{ 'marginTop': '15px' }}>
                <Col span={6}>
                    Pool's Owner:
                </Col>
                <Col span={18}>
                  {this.props.owner}
                </Col>
              </Row>

              <Row style={{ 'marginTop': '15px' }}>
                <Col span={6}>
                    Pool's Website:
                </Col>
                <Col span={18}>
                  <a href={this.props.website} target='_'>{this.props.website}</a>
                </Col>
              </Row>

              <Row style={{ 'marginTop': '15px' }}>
                <Col span={6}>
                    Pool's Location:
                </Col>
                <Col span={18}>
                  {this.props.location}
                </Col>
              </Row>

              <Row style={{ 'marginTop': '15px' }}>
                <Col span={6}>
                    compRate:
                </Col>
                <Col span={18}>
                  {this.props.compRate}
                </Col>
              </Row>

              <Row style={{ 'marginTop': '15px' }}>
                <Col span={6}>
                    logo:
                </Col>
                <Col span={18}>
                  {this.props.logo}
                </Col>
              </Row>

              <Row style={{ 'marginTop': '15px' }}>
                <Col span={6}>
                    Status:
                </Col>
                <Col span={18}>
                  {this.props.poolStatus}
                </Col>
              </Row>

              <Row style={{ 'marginTop': '15px' }}>
                <Col span={6}>
                    Holding Ntf Balance:
                </Col>
                <Col span={18}>
                  {weiToEther(this.props.poolNtfBalance)} NTF
                </Col>
              </Row>

              <Row style={{ 'marginTop': '15px' }}>
                <Col span={6}>
                    Holding Nty Balance:
                </Col>
                <Col span={18}>
                  {weiToEther(this.props.poolNtyBalance)} NTY
                </Col>
              </Row>

              <Row style={{ 'marginTop': '15px' }}>
                <Col span={6}>
                  Amount(NTF):
                </Col>
                <Col span={18}>

                  <InputNumber
                    className = "maxWidth"
                    defaultValue={0}
                    value={this.state.depositAmount}
                    onChange={this.onDepositAmountChange.bind(this)}
                  />
                </Col>
                <Col span={24} style={{ 'marginTop': '15px' }}>
                  <Button onClick={this.deposit.bind(this)} type="primary" className="btn-margin-top submit-button maxWidth">Deposit</Button>
                </Col>
              </Row>

              <Row style={{ 'marginTop': '15px' }}>
                <Col span={6}>
                    Amount(NTF):
                </Col>
                <Col span={18}>

                  <InputNumber
                    className = "maxWidth"
                    defaultValue={0}
                    value={this.state.requestOutAmount}
                    onChange={this.onRequestOutAmountChange.bind(this)}
                  />
                </Col>

                <Col span={24} style={{ 'marginTop': '15px' }}>
                  <Button onClick={this.requestOut.bind(this)} type="primary" className="btn-margin-top submit-button maxWidth">Withdraw Request</Button>
                </Col>
              </Row>
              <Row style={{ 'marginTop': '15px' }}>
                <Col span={24}>
                  <Button style={{ 'width': '100%' }} onClick={this.virtuellMining.bind(this)} type="primary" className="btn-margin-top submit-button">Mining(virtuell) 3ETH</Button>
                </Col>
              </Row>
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
    await this.props.approve(this.state.depositAmount * 1e18)
    await this.props.deposit(this.state.depositAmount * 1e18)
  }

  async withdraw () {
    await this.props.withdraw()
  }

  async requestOut () {
    await this.props.requestOut(this.state.requestOutAmount * 1e18)
  }

  async claim () {
    await this.props.claim()
  }

  virtuellMining () {
    this.props.virtuellMining()
  }
}
