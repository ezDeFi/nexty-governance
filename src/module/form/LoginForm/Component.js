import React from 'react'
import BaseComponent from '@/model/BaseComponent'
import ReCAPTCHA from 'react-google-recaptcha'
import { RECAPTCHA_KEY } from '@/config/constant'
import { Col, Row, Icon, Form, Input, Button, InputNumber, Breadcrumb, Modal, Menu, Checkbox, Alert, message } from 'antd'

import './style.scss'

const FormItem = Form.Item

class C extends BaseComponent {
  handleSubmit (e) {
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values)
        this.props.decryptWallet(values.privateKey)
      }
    })
  }

  getInputProps () {
    const { getFieldDecorator } = this.props.form
    const privateKey_fn = getFieldDecorator('privateKey', {
      rules: [{ required: true, message: 'Please input your private key!' }],
      initialValue: ''
    })
    const privateKey_el = (
      <Input size="large"
        prefix={<Icon type="key" style={{ color: 'rgba(0,0,0,.25)' }}/>}
        placeholder="Private key"/>
    )

    return {
      privateKey: privateKey_fn(privateKey_el)
    }
  }

  ord_render () {
    const { getFieldDecorator } = this.props.form
    const p = this.getInputProps()
    return (
      <Col span={24} className="c_loginForm">
        <Col xs={0} sm={0} md={0} lg={4} xl={4} />
        <Col xs={24} sm={24} md={24} lg={16} xl={16}>
          <p>
                    Do you want to access your wallet?
          </p>
          <Form autoComplete="off" onSubmit={this.handleSubmit.bind(this)} className="c_loginForm">
            <FormItem>
              {p.privateKey}
            </FormItem>
            <FormItem>
              <Col xs={24} sm={24} md={6} lg={6} xl={6} >
                <Button loading={this.props.loading} type="ebp" htmlType="submit" style={{ width: '100%' }}>
                            Login
                </Button>
              </Col>
              {/* &nbsp;&nbsp;
                        <Button loading={this.props.loading} type="blue" htmlType="button" className="">
                            Connect to Metamask
                        </Button> */}
            </FormItem>
          </Form>
        </Col>
      </Col>
    )
  }
}

export default Form.create()(C)
