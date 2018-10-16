import React from 'react';
import BaseComponent from '@/model/BaseComponent';
import { Col, Row, Icon } from 'antd'
import { Link } from 'react-router-dom'

import './style.scss'

export default class extends BaseComponent {
    ord_render() {
        return (
            <div className="c_Footer">
                <div className="d_rowGrey">
                    <Row className="d_rowFooter">
                        <Col xs={24} sm={24} md={12} span={12}>
                            <div className="d_footerSection">
                                <b>WHAT IS NEXTY SMART STAKING?</b>
                                <p className="margin-left-15">Nexty’s unique Smart Staking program plays an active role in user’s staking decisions, which helps the price stabilization program. Smart Staking encourages users to keep the coins with different reward rate incentives throughout different program lengths.</p>
                                <a href="/assets/Nexty-Smart-Staking-How-to-use.pdf" target="_blank"><b>HOW TO USE</b></a>
                            </div>
                        </Col>
                        <Col xs={24} sm={24} md={12} span={12}>
                            <div className="d_footerSection">
                                <b>FOLLOW US ON</b><br />
                                <br />
                                <p>
                                    <a href="https://bitcointalk.org/index.php?topic=2498919"><img src="/assets/images/btc.png" width="25px" /></a>&nbsp; &nbsp;
                                    <a href="https://www.facebook.com/nextycoin"><Icon type="facebook" style={{ fontSize: 22 }} /></a>&nbsp; &nbsp;
                                    <a href="https://twitter.com/nextyio"><Icon type="twitter" style={{ fontSize: 22 }} /></a>
                                </p>
                                <b>Email</b>
                                <p>
                                    <a>support@nexty.io</a>
                                </p>
                            </div>
                        </Col>
                    </Row>
                    <Row className="d_rowFooterBottom">
                        <p className="text-center">2018 © Nexty Platform.</p>
                    </Row>
                </div>
            </div>
        );
    }
}
