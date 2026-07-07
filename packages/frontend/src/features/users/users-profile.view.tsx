import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, Space, message, Modal } from 'antd';
import { UserOutlined, LockOutlined, SaveOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../stores/auth.store';
import { UsersPresenter } from './users.presenter';

const { Title, Paragraph } = Typography;
const presenter = new UsersPresenter();

export const ProfileView: React.FC = () => {
  const { user, token, setAuth } = useAuthStore();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [passwordForm] = Form.useForm();
  const [pwLoading, setPwLoading] = useState(false);

  const handleSaveProfile = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const updatedUser = await presenter.updateProfile({
        fullName: values.fullName,
      });

      if (user && token) {
        setAuth(token, {
          ...user,
          fullName: updatedUser.fullName,
        });
      }
      message.success('Profil berhasil diperbarui!');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Terjadi kesalahan saat menyimpan profil';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      const values = await passwordForm.validateFields();
      setPwLoading(true);

      await presenter.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      message.success('Password changed successfully!');
      passwordForm.resetFields();
      setPasswordModalVisible(false);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'errorFields' in err) return;
      const errorMsg = err instanceof Error ? err.message : 'Failed to change password';
      message.error(errorMsg);
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', width: '100%' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ fontFamily: "var(--font-headline)", color: 'var(--color-primary)', margin: 0 }}>
          Profil Saya
        </Title>
        <Paragraph style={{ fontFamily: "var(--font-body)", color: '#57534E', marginTop: '4px', marginBottom: 0 }}>
          Kelola informasi profil akun Anda dan ubah kata sandi.
        </Paragraph>
      </div>

      <Card
        style={{
          border: 'var(--border-subtle)',
          borderRadius: '8px',
          backgroundColor: 'var(--color-surface)',
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
            label={<span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: '13px', color: '#1C1917' }}>Username</span>}
          >
            <Input disabled prefix={<UserOutlined style={{ color: '#A8A29E' }} />} style={{ height: '42px', borderRadius: '4px' }} />
          </Form.Item>

          <Form.Item
            name="fullName"
            label={<span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: '13px', color: '#1C1917' }}>Nama Lengkap</span>}
            rules={[{ required: true, message: 'Nama lengkap wajib diisi!' }]}
          >
            <Input prefix={<UserOutlined style={{ color: '#A8A29E' }} />} style={{ height: '42px', borderRadius: '4px' }} />
          </Form.Item>

          <Form.Item
            name="role"
            label={<span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: '13px', color: '#1C1917' }}>Peran (Role)</span>}
          >
            <Input disabled style={{ height: '42px', borderRadius: '4px' }} />
          </Form.Item>

          <div style={{ borderTop: 'var(--border-subtle)', margin: '24px 0' }} />

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
              style={{ height: '42px', backgroundColor: 'var(--color-primary)', borderColor: 'var(--color-primary)', borderRadius: '4px', fontWeight: 600 }}
            >
              Simpan Profil
            </Button>
          </Space>
        </Form>
      </Card>

      <Modal
        open={passwordModalVisible}
        title={
          <span style={{ fontFamily: "var(--font-headline)", fontSize: '20px', color: 'var(--color-primary)' }}>
            Change Password
          </span>
        }
        onCancel={() => {
          setPasswordModalVisible(false);
          passwordForm.resetFields();
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            setPasswordModalVisible(false);
            passwordForm.resetFields();
          }} style={{ borderRadius: '4px' }}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={pwLoading}
            onClick={handleChangePassword}
            style={{
              backgroundColor: 'var(--color-primary)',
              borderColor: 'var(--color-primary)',
              borderRadius: '4px',
            }}
          >
            Change Password
          </Button>,
        ]}
        style={{ borderRadius: '8px', overflow: 'hidden' }}
      >
        <Form form={passwordForm} layout="vertical" requiredMark={false} style={{ marginTop: '16px' }}>
          <Form.Item
            name="currentPassword"
            label={<span style={{ fontWeight: 600, fontSize: '13px', color: '#1C1917' }}>Current Password</span>}
            rules={[{ required: true, message: 'Please enter your current password' }]}
          >
            <Input.Password placeholder="Enter current password" />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label={<span style={{ fontWeight: 600, fontSize: '13px', color: '#1C1917' }}>New Password</span>}
            rules={[
              { required: true, message: 'Please enter new password' },
              { min: 6, message: 'Password must be at least 6 characters' },
            ]}
          >
            <Input.Password placeholder="Enter new password (min 6 characters)" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label={<span style={{ fontWeight: 600, fontSize: '13px', color: '#1C1917' }}>Confirm New Password</span>}
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Please confirm your new password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords that you entered do not match!'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirm new password" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
