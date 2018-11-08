import React from 'react'
import StandardPage from '../StandardPage'
import LoginForm from '@/module/form/LoginForm/Container'
import { Col, Row, Icon, Form, Input, Button, InputNumber, Breadcrumb, Modal, Menu, Checkbox, Alert, message } from 'antd'

import './style.scss'

export default class extends StandardPage {
  ord_renderContent () {
    return (
      <div>
        <div className="p_login ebp-wrap" >
          <Col span={24} style={{ marginTop: '100px' }}>
            <LoginForm />

          </Col>

        </div>
      </div>
    )
  }

  ord_checkLogin (isLogin) {
    if (isLogin) {
      this.props.history.replace('/dashboard')
    }
  }
}
