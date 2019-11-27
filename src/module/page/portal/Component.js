import React from 'react' // eslint-disable-line
import StandardPage from '../StandardPage'
import Footer from '@/module/layout/Footer/Container' // eslint-disable-line
import Tx from 'ethereumjs-tx' // eslint-disable-line
import { Link } from 'react-router-dom' // eslint-disable-line
import { cutString } from '@/service/Help'
import moment from 'moment'
import _ from 'lodash'
import { getStatusText, getStatusColor } from '@/util'

import './style.scss'

import { Col, Row, Icon, Menu, Button, Select, Card, Spin, Input, Dropdown } from 'antd' // eslint-disable-line
const Option = Select.Option
const { Meta } = Card

const weiToEther = (wei) => {
  return (Number(wei) / 1e18).toFixed(4)
}

const toTime = (value) => {
  var dateString = moment.unix(value).format('DD/MM/YYYY')
  return dateString
}

const getPoolNtfBalance = (pool) => {
  if (!pool) return 0
  const sum = Number(pool.govNtfBalance) + Number(pool.holdingNtfBalance)
  return weiToEther(sum)
}

export default class extends StandardPage {
  constructor (props) {
    super(props)

    this.state = {
      nameFilter: '',
      selectedStatus: 'All'
    }
  }

  componentDidMount () {
    this.loadData()
  }

  async loadData () {
  }

  gotoPoolDetail (address) {
    this.props.history.push(`/pool?id=${address}`)
  }

  renderCard (pool, key) {
    const color = this.props.loadedTo > key ? getStatusColor(pool.status, getPoolNtfBalance(pool)) : ''
    return (
      <Col md={6} xs={24} key={key}>
        <Card
          hoverable
          onClick={this.gotoPoolDetail.bind(this, pool.address)}
          cover={<img alt={pool.name} src={'/assets/images/default-logo.png'} />}
          /* cover={<img alt={pool.name} src={validURL(pool.logo) ? pool.logo : '/assets/images/default-logo.png'} />} */
        >
          <Meta title={pool.name}/>
          <div class="column-flex" data-heading="Holding NTF:">
            <div>
              <span className="text-number">{this.props.loadedTo > key ? getPoolNtfBalance(pool) + ' NTF' : 'loading'} </span>
            </div>
          </div>
          <div class="column-flex" data-heading="Compensation Rate:">
            <div>
              <span className="text-number">{this.props.loadedTo > key ? pool.compRate + '%' : 'loading'}</span>
            </div>
          </div>
          <div class="column-flex" data-heading="Status:">
            <div>
              <span className={'text-number ' + color}>{this.props.loadedTo > key ? getStatusText(pool.status, getPoolNtfBalance(pool)) : 'loading'}</span>
            </div>
          </div>
        </Card>
      </Col>
    )
  }

  handleSearch (e) {
    this.setState({ nameFilter: e.target.value })
  }

  onSelectStatus (status) {
    this.setState({
      selectedStatus: status
    })
  }

  ord_renderContent () { // eslint-disable-line
    let source = this.props.pools ? this.props.pools : []
    if (!_.isEmpty(source)) {
      this.props.loadPoolPortal(source)
    }
    let poolsPortal = this.props.poolsPortal ? this.props.poolsPortal : []

    if (this.state.nameFilter) {
      poolsPortal = poolsPortal.filter((item) => {
        let regExp = new RegExp(this.state.nameFilter, 'i')

        return (
          regExp.test(item.name)
        )
      })
    }

    if (this.state.selectedStatus !== 'All') {
      poolsPortal = poolsPortal.filter((item) => {
        let status = getStatusText(item.status, getPoolNtfBalance(item))
        return (status === this.state.selectedStatus ? item : null)
      })
    }

    // if (_.isEmpty(poolsPortal)) {
    //   return <div className="spin-loading"><Spin /></div>
    // }

    const statusList = ['All', 'Waiting for Stakes',"Leaked", 'Running', 'Not Joined']

    const menu = (
      <Menu>
        {statusList.map(status =>
          <Menu.Item onClick={() => this.onSelectStatus(status)} key={ status }>
            {status}
          </Menu.Item>)}
      </Menu>
    )

    return (
      <div className="page-portal">
        <Row>
          <Col span={6}>
            <Dropdown overlay={menu}>
              <Button>{this.state.selectedStatus} <Icon type="down" /></Button>
            </Dropdown>
          </Col>
          <Col span={12}>
            <div className="search-box">
              <Input.Search onChange={this.handleSearch.bind(this)}
                placeholder="Search pool name"
              />
            </div>
          </Col>
          <Col span={6}></Col>
        </Row>
        <Row>
          <h3 className="title">Pools             {(_.isEmpty(poolsPortal)) &&
              <Spin />
          }</h3>
        </Row>
        {!_.isEmpty(poolsPortal) && <Row>
          {Object.keys(poolsPortal).length > 0 && Object.values(poolsPortal).map((d, key) => {
            return this.renderCard(d, key)
          })}
        </Row>
        }
      </div>
    )
  }
}
