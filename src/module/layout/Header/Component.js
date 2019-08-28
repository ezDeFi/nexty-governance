import React from 'react' // eslint-disable-line
import BaseComponent from '@/model/BaseComponent'
import { Layout, Menu, Icon, Modal, Button } from 'antd' // eslint-disable-line
import _ from 'lodash' // eslint-disable-line
import I18N from '@/I18N'
import './style.scss'

import { USER_ROLE } from '@/constant'

const { Header } = Layout // eslint-disable-line

export default class extends BaseComponent {
  constructor () {
    super()

    this.state = {

    }
  }
  componentDidMount () {
    document.title = 'Nexty Governance'
  }

  buildAcctDropdown () {
    const isLogin = this.props.isLogin
    const hasAdminAccess = [USER_ROLE.ADMIN, USER_ROLE.COUNCIL].includes(this.props.role)

    return (
      <Menu onClick={this.clickItem.bind(this)}>
        {isLogin
          ? <Menu.Item key="profile">
            {I18N.get('0200')}
          </Menu.Item>
          : <Menu.Item key="login">
            {I18N.get('0201')}
          </Menu.Item>
        }
        {isLogin && hasAdminAccess &&
                    <Menu.Item key="admin/tasks">
                      {I18N.get('0203')}
                    </Menu.Item>
        }
        {isLogin
          ? <Menu.Item key="logout">
            {I18N.get('0204')}
          </Menu.Item>
          : <Menu.Item key="login">
            {I18N.get('0201')}
          </Menu.Item>
        }
      </Menu>
    )
  }

  getSelectedKeys () {
    let keys = _.map(['manage', 'deposit', 'withdraw', 'transfer', 'pool', 'portal'], (key) => {
      return ((this.props.pathname || '').indexOf(`/${key}`) === 0) ? key : ''
    })
    return keys
  }

  gotoHomePage () {
    this.props.history.push('/')
  }

  toggleMobileMenu () {
    this.props.toggleMobileMenu()
  }

  renderHeader () {
    const isLogin = this.props.isLogin

    return (
      <div className="xlogo">
        <span className="logo-icon" onClick={this.gotoHomePage.bind(this)}><img src='/assets/images/logo.png' /></span>
        <div className="header-menu menu-desktop">
          <Menu onClick={this.clickItem.bind(this)} mode="horizontal" selectedKeys={this.getSelectedKeys()}>
            {/* <Menu.Item key="portal">
              <Icon type="unordered-list" /> {I18N.get('0017')}
            </Menu.Item>
            <Menu.Item key="manage">
              <Icon type="setting" /> {I18N.get('0015')}
            </Menu.Item>
            <Menu.Item key="deposit">
              <Icon type="bank" /> {I18N.get('0013')}
            </Menu.Item>
            <Menu.Item key="withdraw">
              <Icon type="export" /> {I18N.get('0014')}
            </Menu.Item>
            <Menu.Item key="transfer">
              <Icon type="credit-card" /> {I18N.get('0016')}
            </Menu.Item> */}
            {isLogin ? <Menu.Item key="logout">
              <Icon type="logout" style={{ color: '#1C7BFF' }} /> {I18N.get('0204')}
            </Menu.Item> : <Menu.Item key="login">
              <Icon type="login" style={{ color: '#1C7BFF' }} /> {I18N.get('0201')}
            </Menu.Item>}
          </Menu>
        </div>
        <div className="show-icon-toggle">
          <span className="c_MenuItem mobile" key="mobileMenu" onClick={this.toggleMobileMenu.bind(this)}>
            <Icon style={{ color: '#47aaa7', fontSize: '22px' }} type="menu-fold"/>
          </span>
        </div>
        {/* {isLogin && <span onClick={this.logout.bind(this)} className="right-action"><a className="logout">{I18N.get('0204')}</a> <Icon type="logout" style={{color: "#1C7BFF"}} /></span>} */}
      </div>
    )
  }

  ord_render () { // eslint-disable-line

    return (
      <Header>
        <div className="Header">
          {this.renderHeader()}
        </div>
      </Header>
    )
  }

  clickItem (e) {
    const key = e.key
    const { isLogin } = this.props

    if (_.includes([
      'home',
      'dashboard',
      'transfer',
      'deposit',
      'withdraw',
      'manage',
      'pool',
      'portal'
    ], key)) {
      if (key === 'landing') {
        this.props.history.push('/')
      } else {
        this.props.history.push('/' + e.key)
      }
    } else if (key === 'logout') {
      this.logout()
    } else if (key === 'login') {
      this.props.history.push('/login')
    }
  }

  logout (e) {
    Modal.confirm({
      title: 'Are you sure you want to logout?',
      content: '',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: () => {
        this.props.logout()
      },
      onCancel () {
      }
    })
  }
}
