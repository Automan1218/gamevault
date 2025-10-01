"use client";
import { Card, Statistic, Row, Col } from "antd";

export default function DevDashboardPage() {
    return (
        <Row gutter={16}>
            <Col span={8}>
                <Card>
                    <Statistic title="Uploaded Games" value={3} />
                </Card>
            </Col>
            <Col span={8}>
                <Card>
                    <Statistic title="Total Downloads" value={1245} />
                </Card>
            </Col>
            <Col span={8}>
                <Card>
                    <Statistic title="Average Rating" value={4.6} suffix="/5" />
                </Card>
            </Col>
        </Row>
    );
}
