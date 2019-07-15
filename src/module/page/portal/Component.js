import React from 'react' // eslint-disable-line
import StandardPage from '../StandardPage'
import Footer from '@/module/layout/Footer/Container' // eslint-disable-line
import Tx from 'ethereumjs-tx' // eslint-disable-line
import { Link } from 'react-router-dom' // eslint-disable-line
import { cutString } from '@/service/Help'
import moment from 'moment'
import _ from 'lodash'
import { validURL } from '@/util'

import './style.scss'

import { Col, Row, Icon, InputNumber, Button, Select, Card, Spin, Input } from 'antd' // eslint-disable-line
const Option = Select.Option
const { Meta } = Card;

const weiToEther = (wei) => {
  return (Number(wei) / 1e18).toFixed(4)
}

const toTime = (value) => {
  var dateString = moment.unix(value).format('DD/MM/YYYY')
  return dateString
}

export default class extends StandardPage {

  constructor(props) {
      super(props)

      this.state = {
          nameFilter: ''
      }
  }

  componentDidMount () {
    this.loadData()
  }

  async loadData () {
  }

  gotoPoolDetail(address) {
    this.props.history.push(`/pool?id=${address}`)
  }

  renderCard (pool, key) {
    return (
      <Col md={6} xs={24} key={key}>
        <Card
          hoverable
          onClick={this.gotoPoolDetail.bind(this, pool.address)}
          cover={<img alt={pool.name} src={'/assets/images/default-logo.png'} />}
          /* cover={<img alt={pool.name} src={validURL(pool.logo) ? pool.logo : '/assets/images/default-logo.png'} />} */
        >
          <Meta title={pool.name}/>
            <div class="column-flex" data-heading="Holding NTF Balance:">
              <div>
                <span className="text-number">{weiToEther(pool.poolNtfBalance)} NTF</span>
              </div>
            </div>
            <div class="column-flex" data-heading="Compensation Rate:">
              <div>
                <span className="text-number">{pool.compRate} %</span>
              </div>
            </div>
        </Card>
      </Col>
    )
  }

  handleSearch(value) {
      this.setState({nameFilter: value})
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

    if (_.isEmpty(poolsPortal)) {
      return <div className="spin-loading"><Spin /></div>
    }

    return (
        <div className="page-portal">
          <Row>
            <div className="search-box">
              <Input.Search onSearch={this.handleSearch.bind(this)}
                size="large"
                placeholder="Search pool name"
              />
            </div>
          </Row>
          <Row>
            <h3 className="title">Pools</h3>
          </Row>
          <Row>
            {Object.keys(poolsPortal).length > 0 && Object.values(poolsPortal).map((d, key) => {
              return this.renderCard(d, key)
            })}
          </Row>
        </div>
    )
  }
}
