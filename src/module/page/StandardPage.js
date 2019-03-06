import React from 'react' // eslint-disable-line
import BasePage from '@/model/BasePage'
import { Layout } from 'antd' // eslint-disable-line
import Header from '../layout/Header/Container' // eslint-disable-line
import Footer from '../layout/Footer/Container' // eslint-disable-line

export default class extends BasePage {
  ord_renderPage () { // eslint-disable-line
    return (
      <Layout className="p_standardPage">
        <Header/>
        <Layout.Content>
          {this.ord_renderContent()}
        </Layout.Content>
        <Footer />
      </Layout>
    )
  }

  ord_renderContent () { // eslint-disable-line
    return null
  }
}
