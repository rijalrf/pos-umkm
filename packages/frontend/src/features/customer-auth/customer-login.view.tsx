import React from 'react';
import { Card, Form, Input, Button, Typography, Space } from 'antd';
import { MailOutlined, LockOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useCustomerAuthPresenter } from './customer-auth.presenter';
import type { CustomerLoginPayload } from './customer-auth.types';

const { Title, Text, Paragraph } = Typography;

export const CustomerLoginView: React.FC = () => {
  const navigate = useNavigate();
  const presenter = useCustomerAuthPresenter();

  const onFinish = async (values: CustomerLoginPayload) => {
    const success = await presenter.loginCustomer(values);
    if (success) {
      navigate('/customer/catalog');
    }
  };

  return (
    <div className="customer-centered">
      <Card className="w-full" style={{ maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Button
            type="link"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/customer/catalog')}
            style={{ color: '#57534E', padding: 0, height: 'auto', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            Kembali ke Katalog
          </Button>
          <Title level={2} className="headline-text" style={{ color: 'var(--color-primary)', margin: '0 0 8px 0' }}>
            Masuk Member
          </Title>
          <Paragraph className="body-text" style={{ color: '#57534E', fontSize: '14px' }}>
            Masuk untuk melihat riwayat belanja Anda.
          </Paragraph>
        </div>

        <Form name="customer_login" onFinish={onFinish} layout="vertical" size="large">
          <Form.Item
            label="Alamat Email"
            name="email"
            rules={[
              { required: true, message: 'Alamat email wajib diisi!' },
              { type: 'email', message: 'Format email tidak valid!' },
            ]}
          >
            <Input prefix={<MailOutlined className="login-input-prefix" />} placeholder="nama@email.com" className="input-medium" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Password wajib diisi!' }]}
          >
            <Input.Password prefix={<LockOutlined className="login-input-prefix" />} placeholder="Password Anda" className="input-medium" />
          </Form.Item>

          <Form.Item style={{ marginTop: '24px' }}>
            <Button type="primary" htmlType="submit" loading={presenter.loading} block className="btn-primary-terracotta">
              Masuk Sekarang
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <Space>
            <Text type="secondary">Belum terdaftar?</Text>
            <Button type="link" onClick={() => navigate('/customer/register')} className="text-primary-color" style={{ fontWeight: 600, padding: 0 }}>
              Daftar Member Baru
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default CustomerLoginView;
