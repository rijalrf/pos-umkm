import React from 'react';
import { Card, Col, Row, Statistic, Typography } from 'antd';
import { ShoppingOutlined, TagsOutlined, UserOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../stores/auth.store';

const { Title, Paragraph } = Typography;

export const DashboardView: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0 }}>Dashboard</Title>
        <Paragraph type="secondary">
          Welcome back, {user?.fullName}. Here is a quick snapshot of your backoffice system.
        </Paragraph>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ background: '#f8fafc', borderLeft: '4px solid #6366f1' }}>
            <Statistic title="Products Managed" value={120} prefix={<ShoppingOutlined style={{ color: '#6366f1' }} />} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ background: '#f8fafc', borderLeft: '4px solid #10b981' }}>
            <Statistic title="Categories" value={8} prefix={<TagsOutlined style={{ color: '#10b981' }} />} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ background: '#f8fafc', borderLeft: '4px solid #f59e0b' }}>
            <Statistic title="Active Sessions" value={2} prefix={<UserOutlined style={{ color: '#f59e0b' }} />} />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: '24px' }} title="POS System Overview">
        <Paragraph>
          This application enables managing products, handling fast cashier sales, and generating automated reports.
          Use the left-hand navigation to explore products, category templates, settings, or trigger a sale.
        </Paragraph>
      </Card>
    </div>
  );
};
