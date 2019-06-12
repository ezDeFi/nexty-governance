import React from 'react' // eslint-disable-line
import BaseComponent from '@/model/BaseComponent'
import { Col, Row, Icon } from 'antd' // eslint-disable-line
import { Link } from 'react-router-dom' // eslint-disable-line

import './style.scss'

export default class extends BaseComponent {
  ord_render () { // eslint-disable-line
    return (
      <div className="c_Footer">
        <div className="d_rowGrey">
          <Row className="d_rowFooter">
            <Col xs={24} sm={24} md={8}>
              <div className="d_footerSection">
                <p className="title">Email</p>
                <p className="content">support@nexty.io</p>
              </div>
            </Col>
            <Col xs={24} sm={24} md={8}>
              <div className="d_footerSection">
                <p className="title">Follow us on</p>
                <p className="content">
                  <a href="https://bitcointalk.org/index.php?topic=2498919"><img src="/assets/images/btc.png" width="25px" /></a>&nbsp; &nbsp;
                  <a href="https://www.facebook.com/nextycoin"><Icon type="facebook" style={{ fontSize: 22, color: "#1976D2" }} /></a>&nbsp; &nbsp;
                  <a href="https://twitter.com/nextyio"><Icon type="twitter" style={{ fontSize: 22, color: "#03A9F4" }} /></a>
                </p>
              </div>
            </Col>
            <Col xs={24} sm={24} md={8}>
              <div className="d_footerSection">
                <p className="title">What is Nexty Governance ?</p>
                <p className="content">
                  <a className="how-to-use" href="/assets/howtouse.pdf" target="_blank">How to use</a>
                </p>
              </div>
            </Col>
          </Row>
          <Row className="d_rowFooterBottom">
            <p className="text-center">2018 © Nexty Platform.</p>
          </Row>
        </div>
      </div>
    )
  }
}
