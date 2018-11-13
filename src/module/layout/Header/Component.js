import React from 'react' // eslint-disable-line
import BaseComponent from '@/model/BaseComponent'
import { Layout, Menu, Icon, Modal, Button } from 'antd' // eslint-disable-line
import _ from 'lodash' // eslint-disable-line
import I18N from '@/I18N'
import './style.scss'

import { USER_ROLE } from '@/constant'

const { Header } = Layout // eslint-disable-line

export default class extends BaseComponent {
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
        {isLogin &&
                    <Menu.Item key="logout">
                      {I18N.get('0204')}
                    </Menu.Item>
        }
      </Menu>
    )
  }

  renderHeader () {
    const isLogin = this.props.isLogin
    if (isLogin) {
      return (

        <Button className="right-side" onClick={this.logout.bind(this)} ghost>
          <Icon type="logout" />{I18N.get('0204')}
        </Button>

      )
    } else {
      return (
        <div className="xlogo" style={{ background: '#0d47a1' }}>

          <img src='/assets/images/Asset 1@20x-8.png' />
          <link rel="shortcut icon" href="assets/images/btc.gif"/>
        </div>

      )
    }
  }

  ord_render () { // eslint-disable-line

    return (
      <Header style={{ background: '#0d47a1', padding: 0 }}>
        {this.renderHeader()}

      </Header>
    )
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
