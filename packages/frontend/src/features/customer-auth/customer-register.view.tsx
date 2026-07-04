import React from 'react';
import { Card, Form, Input, Button, Typography, Space } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, PhoneOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useCustomerAuthPresenter } from './customer-auth.presenter';
import type { CustomerRegisterPayload } from './customer-auth.types';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export const CustomerRegisterView: React.FC = () => {
  const navigate = useNavigate();
  const presenter = useCustomerAuthPresenter();

  const onFinish = async (values: CustomerRegisterPayload) => {
    const success = await presenter.registerCustomer(values);
    if (success) {
      navigate('/customer/login');
    }
  };

  return (
    <div className="customer-centered">
      <Card className="w-full" style={{ maxWidth: '500px' }}>
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
            Daftar Member
          </Title>
          <Paragraph className="body-text" style={{ color: '#57534E', fontSize: '14px' }}>
            Bergabunglah menjadi member untuk menyimpan dan memantau riwayat belanja Anda.
          </Paragraph>
        </div>

        <Form name="customer_register" onFinish={onFinish} layout="vertical" size="large">
          <Form.Item label="Nama Lengkap" name="name" rules={[{ required: true, message: 'Nama lengkap wajib diisi!' }]}>
            <Input prefix={<UserOutlined className="login-input-prefix" />} placeholder="Nama Lengkap Anda" className="input-medium" />
          </Form.Item>

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
            rules={[
              { required: true, message: 'Password wajib diisi!' },
              { min: 6, message: 'Password minimal 6 karakter!' },
            ]}
          >
            <Input.Password prefix={<LockOutlined className="login-input-prefix" />} placeholder="Minimal 6 karakter" className="input-medium" />
          </Form.Item>

          <Form.Item label="Nomor Telepon" name="phone" rules={[{ pattern: /^[0-9]+$/, message: 'Hanya boleh berisi angka!' }]}>
            <Input prefix={<PhoneOutlined className="login-input-prefix" />} placeholder="Contoh: 08123456789" className="input-medium" />
          </Form.Item>

          <Form.Item label="Alamat Pengiriman" name="address">
            <TextArea rows={3} placeholder="Tulis alamat lengkap Anda untuk mempermudah proses kasir/pengiriman" />
          </Form.Item>

          <Form.Item style={{ marginTop: '24px' }}>
            <Button type="primary" htmlType="submit" loading={presenter.loading} block className="btn-primary-terracotta">
              Mendaftar Sekarang
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <Space>
            <Text type="secondary">Sudah terdaftar?</Text>
            <Button type="link" onClick={() => navigate('/customer/login')} className="text-primary-color" style={{ fontWeight: 600, padding: 0 }}>
              Masuk di sini
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default CustomerRegisterView;
