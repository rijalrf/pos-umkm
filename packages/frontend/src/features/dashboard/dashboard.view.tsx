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
        <Title level={2} style={{ margin: 0, fontFamily: "'Playfair Display', serif", color: '#C2410C' }}>Dashboard</Title>
        <Paragraph style={{ fontFamily: "'Inter', sans-serif", color: '#57534E', fontSize: '15px' }}>
          Welcome back, {user?.fullName}. Here is a quick snapshot of your backoffice system.
        </Paragraph>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card bordered={true} style={{ background: '#FFFFFF', borderLeft: '4px solid #C2410C', borderColor: '#E7E5E4' }}>
            <Statistic title="Products Managed" value={120} prefix={<ShoppingOutlined style={{ color: '#C2410C' }} />} valueStyle={{ color: '#C2410C' }} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={true} style={{ background: '#FFFFFF', borderLeft: '4px solid #365314', borderColor: '#E7E5E4' }}>
            <Statistic title="Categories" value={8} prefix={<TagsOutlined style={{ color: '#365314' }} />} valueStyle={{ color: '#365314' }} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={true} style={{ background: '#FFFFFF', borderLeft: '4px solid #D4A373', borderColor: '#E7E5E4' }}>
            <Statistic title="Active Sessions" value={2} prefix={<UserOutlined style={{ color: '#D4A373' }} />} valueStyle={{ color: '#D4A373' }} />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: '24px', borderColor: '#E7E5E4' }} title={<span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>POS System Overview</span>}>
        <Paragraph style={{ fontFamily: "'Inter', sans-serif", color: '#1C1917', lineHeight: '1.6' }}>
          This application enables managing products, handling fast cashier sales, and generating automated reports.
          Use the left-hand navigation to explore products, category templates, settings, or trigger a sale.
        </Paragraph>
      </Card>
    </div>
  );
};

