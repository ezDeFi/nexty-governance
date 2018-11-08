import React from 'react'
import BaseComponent from '@/model/BaseComponent'
import {Layout, Menu, Icon, Badge, Avatar, Modal, Dropdown, Button} from 'antd'
import _ from 'lodash'
import I18N from '@/I18N'

import {USER_ROLE} from '@/constant';
import './style.scss';
const { Header, Sider, Content } = Layout

// const {Header} = Layout;
const SubMenu = Menu.SubMenu
const MenuItemGroup = Menu.ItemGroup

function isMobileDevice() {
    return (typeof window.orientation !== 'undefined') || (navigator.userAgent.indexOf('IEMobi l e') !== -1);
};

const isMobile = isMobileDevice();

export default class extends BaseComponent {
    constructor() {
        super();
        this.state = {
            height: window.innerHeight,
            width: window.innerWidth
        };
        this.updateDimensions = this.updateDimensions.bind(this);
    }

    updateDimensions() {
        if ((!this.state.collapsed) && (this.state.width > window.innerWidth))
        { this.setState({
            collapsed: true,
            siderWidth: '0px'
        }); }

        if ((this.state.collapsed) && (this.state.width < window.innerWidth))
        { this.setState({
            collapsed: false,
            siderWidth: '200px'
        }); }

        this.setState({
            height: window.innerHeight,
            width: window.innerWidth
        });
    }
    componentDidMount() {
        document.title = 'Nexty Governance'
        window.addEventListener('resize', this.updateDimensions);
        this.loadData()
    }
  state = {
      collapsed: isMobile
  }
toggleCollapsed = () => {
    this.setState({
        collapsed: !this.state.collapsed,
        siderWidth: this.state.collapsed ? '200px' : '0px'
    });
    console.log(this.state.siderWidth)
}

loadData() {
    this.setState({
        siderWidth: this.state.collapsed ? '0px' : '200px'
    });
}

ord_render() {
    const isAdmin = this.props.isAdmin
    return (

        <Sider collapsed={this.state.collapsed}
            trigger={null}
            collapsedWidth="0px"
            collapsible
            style={{align: 'left'}}
        >
            <div className="xlogo" style={{background: '#0d47a1'}}>
                <img src='/assets/images/Asset 1@20x-8.png' />
            </div>
            <div style={{width: '50px', height: '50px', position: 'fixed', bottom: '20px', left: '20px', zIndex: '99999'}}>
                <a href="https://t.me/nexty_io" target="_blank" rel="noopener"><img style ={{width: '50px', zIndex: '99999'}} src="/assets/images/telegram.png" /></a>
            </div>

            <Icon onClick={this.toggleCollapsed} type={'menu-unfold'}
                style={{ position: 'fixed', top: (window.innerHeight - 186) / 2, background: 'white', left: 0, fontSize: 20, zIndex: '1', display: !this.state.collapsed ? 'none' : 'block' }}
            />

            <Icon onClick={this.toggleCollapsed} type={'menu-fold'}
                style={{ position: 'absolute', top: (window.innerHeight - 186) / 2, left: this.state.siderWidth, fontSize: 20, display: this.state.collapsed ? 'none' : 'block' }}
            />

            <Menu onClick={this.clickItem.bind(this)} theme="dark" mode="inline" className="menu-sidebar" defaultSelectedKeys={this.detectUrl()}>
                <Menu.Item key="dashboard">
                    <Icon type="dashboard" /> {I18N.get('0003')}
                </Menu.Item>
                <Menu.Item key="transfer">
                    <Icon type="wallet" /> {I18N.get('0016')}
                </Menu.Item>
                <Menu.Item key="deposit">
                    <Icon type="wallet" /> {I18N.get('0013')}
                </Menu.Item>
                <Menu.Item key="withdraw">
                    <Icon type="wallet" /> {I18N.get('0014')}
                </Menu.Item>
                <Menu.Item key="manager">
                    <Icon type="wallet" /> {I18N.get('0015')}
                </Menu.Item>

            </Menu>

        </Sider>

    )
}

clickItem(e) {
    const key = e.key
    if (_.includes([
        'home',
        'dashboard',
        'transfer',
        'deposit',
        'withdraw',
        'manager'
    ], key)) {
        this.props.history.push('/' + e.key)
    }
    else if (key === 'logout') {
        Modal.confirm({
            title: 'Are you sure you want to logout?',
            content: '',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk: () => {
                this.props.logout()
            },
            onCancel() {
            }
        })
    }
}

detectUrl() {
    let url = window.location.pathname;

    let sidebar = [
        'home',
        'dashboard',
        'transfer',
        'deposit',
        'withdraw',
        'manager'
    ];

    if (!url) {
        return ['dashboard']
    }

    for (var menu in sidebar) {
        try {
            if (url.indexOf(sidebar[menu]) > -1) {
                return [sidebar[menu]];
                break;
            }
        } catch (e) {
            return [sidebar[0]];
        }
    }
    return [sidebar[0]];
}
}
