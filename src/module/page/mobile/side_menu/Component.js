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
            'home',
            'rankings',
            'posts',
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
                    >
                        { isLogin &&
                            <Menu.Item key="profile/info">
                                <b>{username}</b>
                            </Menu.Item>
                        }
                        <Menu.Item key="rankings">
                            XẾP HẠNG PAGES
                        </Menu.Item>
                        <Menu.Item key="groups">
                            XẾP HẠNG GROUPS
                        </Menu.Item>
                        <Menu.Item key="posts">
                            TOP BÀI VIẾT
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
                        <Menu.Item key="create-page">
                            THÊM PAGE
                        </Menu.Item>
                        <Menu.Item key="create-group">
                            THÊM GROUP
                        </Menu.Item>
                        {isLogin &&
                        <Menu.Item key="logout">
                            THOÁT
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
