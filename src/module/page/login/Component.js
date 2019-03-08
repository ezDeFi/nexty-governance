import React from 'react' // eslint-disable-line
import StandardPage from '../StandardPage'
import LoginForm from '@/module/form/LoginForm/Container' // eslint-disable-line
import { Col, Spin } from 'antd' // eslint-disable-line

import './style.scss'

export default class extends StandardPage {
  ord_renderContent () { // eslint-disable-line
    return (
      <div>
        <div className="p_login ebp-wrap" >
          <Col span={24} style={{ marginTop: '100px' }}>
            {window.ethereum ? <div>
              <Spin tip="Loading...">
              </Spin>
            </div>
              :
             <LoginForm />}
          </Col>

        </div>
      </div>
    )
  }

  ord_checkLogin (isLogin) { // eslint-disable-line
    if (isLogin) {
      this.props.history.replace('/dashboard')
    }
  }
}
