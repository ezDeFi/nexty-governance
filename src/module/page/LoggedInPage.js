import React from 'react'
import BasePage from '@/model/BasePage'
import {
  Layout, Menu, Icon, Input, Upload, message, Button, Breadcrumb, Alert, BackTop } from 'antd'
import Header from '../layout/Header/Container'
// import './style.scss';
import Sidebar from '../layout/Sidebar/Container'
import Footer from '../layout/Footer/Container'

const { Sider, Content } = Layout
const ReactRouter = require('react-router-dom')
const Link = ReactRouter.Link

export default class extends BasePage {
  ord_renderPage () {
    return (
      <div>
        <Layout>
          <BackTop />
          <Sidebar />
          <Layout>
            {/* <Header style={{ background: '#3c8dbc', padding: 0 }}> */}
            {/* <Icon
                            className="trigger"
                            type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
                            onClick={this.toggle}
                        /> */}
            {/* </Header> */}
            <Header />
            {/* <Breadcrumb.Item><Link to="/"><Icon type="home" /> Home</Link></Breadcrumb.Item>
                        <Breadcrumb.Item>Login</Breadcrumb.Item> */}
            {this.ord_renderBreadcrumb()}
            <Content style={{ margin: '16px 16px', padding: 24, background: '#fff', minHeight: 280 }}>
              {this.ord_renderContent()}
            </Content>
          </Layout>
        </Layout>
        <Footer />
      </div>
    // <Layout className="p_standardPage">
    //     <Header/>
    //     <Layout.Content>
    //         {this.ord_renderContent()}
    //     </Layout.Content>

    // </Layout>
    )
  }

  ord_renderContent () {
    return null
  }

  ord_renderBreadcrumb () {
    return null
  }
}
