import React from 'react';
import { Card, Form, Input, Button, Typography, Space } from 'antd';
import { MailOutlined, LockOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useCustomerPresenter } from './customer.presenter';

const { Title, Text, Paragraph } = Typography;

export const CustomerLoginView: React.FC = () => {
  const navigate = useNavigate();
  const { loading, loginCustomer } = useCustomerPresenter();

  const onFinish = async (values: any) => {
    const success = await loginCustomer({
      email: values.email,
      password: values.password,
    });
    if (success) {
      navigate('/customer/catalog');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 240px)', padding: '24px 0' }}>
      <Card
        style={{
          width: '100%',
          maxWidth: '420px',
          borderColor: '#D6D3D1',
          borderRadius: '8px',
          background: '#FFFFFF',
        }}
        bodyStyle={{ padding: '32px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Button
            type="link"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/customer/catalog')}
            style={{ color: '#57534E', padding: 0, height: 'auto', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            Kembali ke Katalog
          </Button>
          <Title level={2} style={{ fontFamily: "'Playfair Display', serif", color: '#C2410C', margin: '0 0 8px 0' }}>
            Masuk Member
          </Title>
          <Paragraph style={{ fontFamily: "'Inter', sans-serif", color: '#57534E', fontSize: '14px' }}>
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
            <Input prefix={<MailOutlined style={{ color: '#A8A29E' }} />} placeholder="nama@email.com" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Password wajib diisi!' }]}
          >
            <Input.Password prefix={<LockOutlined style={{ color: '#A8A29E' }} />} placeholder="Password Anda" />
          </Form.Item>

          <Form.Item style={{ marginTop: '24px' }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{
                backgroundColor: '#C2410C',
                borderColor: '#C2410C',
                fontWeight: 600,
                height: '42px',
                borderRadius: '4px',
              }}
            >
              Masuk Sekarang
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <Space>
            <Text type="secondary">Belum terdaftar?</Text>
            <Button
              type="link"
              onClick={() => navigate('/customer/register')}
              style={{ color: '#C2410C', fontWeight: 600, padding: 0 }}
            >
              Daftar Member Baru
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default CustomerLoginView;
