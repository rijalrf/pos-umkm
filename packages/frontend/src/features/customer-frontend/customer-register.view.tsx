import React from 'react';
import { Card, Form, Input, Button, Typography, Space } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, PhoneOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useCustomerPresenter } from './customer.presenter';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export const CustomerRegisterView: React.FC = () => {
  const navigate = useNavigate();
  const { loading, registerCustomer } = useCustomerPresenter();

  const onFinish = async (values: any) => {
    const success = await registerCustomer({
      email: values.email,
      password: values.password,
      name: values.name,
      phone: values.phone,
      address: values.address,
    });
    if (success) {
      navigate('/customer/login');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 240px)', padding: '24px 0' }}>
      <Card
        style={{
          width: '100%',
          maxWidth: '500px',
          borderColor: '#D6D3D1',
          borderRadius: '8px',
          background: '#FFFFFF',
        }}
        styles={{ body: { padding: '32px' } }}
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
            Daftar Member
          </Title>
          <Paragraph style={{ fontFamily: "'Inter', sans-serif", color: '#57534E', fontSize: '14px' }}>
            Bergabunglah menjadi member untuk menyimpan dan memantau riwayat belanja Anda.
          </Paragraph>
        </div>

        <Form name="customer_register" onFinish={onFinish} layout="vertical" size="large">
          <Form.Item
            label="Nama Lengkap"
            name="name"
            rules={[{ required: true, message: 'Nama lengkap wajib diisi!' }]}
          >
            <Input prefix={<UserOutlined style={{ color: '#A8A29E' }} />} placeholder="Nama Lengkap Anda" />
          </Form.Item>

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
            rules={[
              { required: true, message: 'Password wajib diisi!' },
              { min: 6, message: 'Password minimal 6 karakter!' },
            ]}
          >
            <Input.Password prefix={<LockOutlined style={{ color: '#A8A29E' }} />} placeholder="Minimal 6 karakter" />
          </Form.Item>

          <Form.Item
            label="Nomor Telepon"
            name="phone"
            rules={[{ pattern: /^[0-9]+$/, message: 'Hanya boleh berisi angka!' }]}
          >
            <Input prefix={<PhoneOutlined style={{ color: '#A8A29E' }} />} placeholder="Contoh: 08123456789" />
          </Form.Item>

          <Form.Item label="Alamat Pengiriman" name="address">
            <TextArea rows={3} placeholder="Tulis alamat lengkap Anda untuk mempermudah proses kasir/pengiriman" />
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
              Mendaftar Sekarang
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <Space>
            <Text type="secondary">Sudah terdaftar?</Text>
            <Button
              type="link"
              onClick={() => navigate('/customer/login')}
              style={{ color: '#C2410C', fontWeight: 600, padding: 0 }}
            >
              Masuk di sini
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default CustomerRegisterView;
