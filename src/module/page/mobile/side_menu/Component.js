import React from 'react'
import BaseComponent from '@/model/BaseComponent'

import {Row, Col, Icon, Menu, Avatar} from 'antd';

import './style'
import { Modal } from 'antd/lib/index'
import _ from 'lodash'
import I18N from '@/I18N'

import {USER_ROLE, USER_LANGUAGE, USER_AVATAR_DEFAULT, CATE_ID} from '@/constant'

export default class extends BaseComponent {

    handleMenuClick(ev,) {
        const key = ev.key
        const { isLogin } = this.props

        if (_.includes([
            'signup',
            'profile/info',
            'help',
            'about',
            'faq',
            'contact',
            'manage',
            'deposit',
            'withdraw',
            'transfer',
            'pool',
            'portal',
        ], key)) {
            this.props.history.push('/' + ev.key)
        } else if (key === 'login' || key === 'register') {
            this.props.toggleMobileMenu()
        }

        else if (key === 'logout') {
            this.props.toggleMobileMenu()
            this.props.logout()
        } else if (key === 'landing') {
            this.props.history.push('/')
        }
    }

    getSelectedKeys() {
      let keys = _.map(['manage', 'deposit', 'withdraw', 'transfer', 'pool', 'portal'], (key) => {
          return ((this.props.pathname || '').indexOf(`/${key}`) === 0) ? key : ''
      })
      return keys
    }

    ord_render () {

        const isLogin = this.props.user.is_login
        const hasAdminAccess = [USER_ROLE.ADMIN, USER_ROLE.COUNCIL].includes(this.props.user.role)
        const profile = this.props.user.profile
        const username = profile.lastName ? `${profile.firstName} ${profile.lastName}` : this.props.user.username

        // animateStyle is passed in and handled by react-motion
        return <div className="c_mobileMenu" style={this.props.animateStyle}>
            <Row>
                <Col className="right-align">
                    <Icon className="closeMobileMenu" type="menu-unfold" onClick={this.props.toggleMobileMenu}/>
                </Col>
            </Row>
            <Row>
                <Col className="menuContainer">
                    <Menu
                        onClick={this.handleMenuClick.bind(this)}
                        mode="inline"
                        selectedKeys={this.getSelectedKeys()}
                    >
                        { isLogin &&
                            <Menu.Item key="profile/info">
                                <b>{username}</b>
                            </Menu.Item>
                        }
                        <Menu.Item key="portal">
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
                        </Menu.Item>
                    </Menu>
                </Col>
            </Row>
            <Row>
                <Col className="menuContainer">
                    <Menu
                        onClick={this.handleMenuClick.bind(this)}
                        mode="inline"
                    >
                        {isLogin &&
                        <Menu.Item key="logout">
                            <Icon type="logout" style={{color: "#1C7BFF"}} /> {I18N.get('0204')}
                        </Menu.Item>
                        }
                    </Menu>
                </Col>
            </Row>
            <Row>
                <Col className="menuContainer">
                    <Menu
                        onClick={this.handleMenuClick.bind(this)}
                        mode="inline"
                    >
                    </Menu>
                </Col>
            </Row>
        </div>
    }

}
