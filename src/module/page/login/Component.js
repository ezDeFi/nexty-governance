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
          <Col span={24} style={{ marginTop: '30px', marginBottom: '30px' }}>
            {(this.props.loginMetamask) && <div>
              <Spin tip="Logging in with MetaMask...">
              </Spin>
            </div>}
            {(!this.props.loginMetamask) && <div className="login-metamask">
              <img src="/assets/images/metamask.svg" with="100px" height="100px" /><h2>Login with <a href="https://metamask.io/" target="_blank">MetaMask</a> or Private Key</h2>
            </div>}
             <LoginForm />
          </Col>

        </div>
      </div>
    )
  }

  ord_checkLogin (isLogin) { // eslint-disable-line
    if (isLogin) {
      this.props.history.replace('/manage')
    }
  }
}
