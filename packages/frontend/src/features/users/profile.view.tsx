import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, Space, message } from 'antd';
import { UserOutlined, LockOutlined, SaveOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../stores/auth.store';
import { api } from '../../libs/api.lib';
import { PasswordChangeModalView } from './password-change-modal.view';

const { Title, Paragraph } = Typography;

export const ProfileView: React.FC = () => {
  const { user, token, setAuth } = useAuthStore();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);

  const handleSaveProfile = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const response = await api.put('/users/profile', {
        fullName: values.fullName,
      });

      if (response.data && response.data.success) {
        // Update user context in auth store
        const updatedUser = response.data.data;
        if (user && token) {
          setAuth(token, {
            ...user,
            fullName: updatedUser.fullName,
          });
        }
        message.success('Profil berhasil diperbarui!');
      } else {
        message.error(response.data.message || 'Gagal memperbarui profil');
      }
    } catch (err: any) {
      console.error(err);
      message.error(err.response?.data?.message || 'Terjadi kesalahan saat menyimpan profil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', width: '100%' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ fontFamily: "'Inter', sans-serif", color: '#C2410C', margin: 0 }}>
          Profil Saya
        </Title>
        <Paragraph style={{ fontFamily: "'Inter', sans-serif", color: '#57534E', marginTop: '4px', marginBottom: 0 }}>
          Kelola informasi profil akun Anda dan ubah kata sandi.
        </Paragraph>
      </div>

      <Card
        style={{
          border: '1px solid #E7E5E4',
          borderRadius: '8px',
          backgroundColor: '#FFFFFF',
        }}
        bodyStyle={{ padding: '24px' }}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            username: user?.username,
            fullName: user?.fullName,
            role: user?.role === 'ADMIN' ? 'Administrator' : 'Kasir',
          }}
          onFinish={handleSaveProfile}
        >
          <Form.Item
            name="username"
            label={<span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: '13px', color: '#1C1917' }}>Username</span>}
          >
            <Input disabled prefix={<UserOutlined style={{ color: '#A8A29E' }} />} style={{ height: '42px', borderRadius: '4px' }} />
          </Form.Item>

          <Form.Item
            name="fullName"
            label={<span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: '13px', color: '#1C1917' }}>Nama Lengkap</span>}
            rules={[{ required: true, message: 'Nama lengkap wajib diisi!' }]}
          >
            <Input prefix={<UserOutlined style={{ color: '#A8A29E' }} />} style={{ height: '42px', borderRadius: '4px' }} />
          </Form.Item>

          <Form.Item
            name="role"
            label={<span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: '13px', color: '#1C1917' }}>Peran (Role)</span>}
          >
            <Input disabled style={{ height: '42px', borderRadius: '4px' }} />
          </Form.Item>

          <div style={{ borderTop: '1px solid #E7E5E4', margin: '24px 0' }} />

          <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              type="default"
              icon={<LockOutlined />}
              onClick={() => setPasswordModalVisible(true)}
              style={{ height: '42px', borderRadius: '4px' }}
            >
              Ubah Password
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              htmlType="submit"
              loading={loading}
              style={{ height: '42px', backgroundColor: '#C2410C', borderColor: '#C2410C', borderRadius: '4px', fontWeight: 600 }}
            >
              Simpan Profil
            </Button>
          </Space>
        </Form>
      </Card>

      <PasswordChangeModalView
        visible={passwordModalVisible}
        onCancel={() => setPasswordModalVisible(false)}
        onSuccess={() => setPasswordModalVisible(false)}
      />
    </div>
  );
};
