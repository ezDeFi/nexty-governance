import React from 'react' // eslint-disable-line
import BasePage from '@/model/BasePage'
import { Layout, BackTop } from 'antd' // eslint-disable-line
import Header from '../layout/Header/Container' // eslint-disable-line
// import './style.scss';
import Sidebar from '../layout/Sidebar/Container' // eslint-disable-line
import Footer from '../layout/Footer/Container' // eslint-disable-line

const { Content } = Layout // eslint-disable-line
const ReactRouter = require('react-router-dom') // eslint-disable-line

export default class extends BasePage {
  ord_renderPage () { // eslint-disable-line
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

  ord_renderContent () { // eslint-disable-line
    return null
  }

  ord_renderBreadcrumb () { // eslint-disable-line
    return null
  }
}
