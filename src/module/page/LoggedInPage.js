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
          <Layout>
            <Header />
            <Content style={{ margin: '16px 16px', padding: 24, background: '#fff', minHeight: 280 }}>
              {this.ord_renderContent()}
            </Content>
          </Layout>
        </Layout>
        <Footer />
      </div>
    )
  }

  ord_renderContent () { // eslint-disable-line
    return null
  }

  ord_renderBreadcrumb () { // eslint-disable-line
    return null
  }
}
