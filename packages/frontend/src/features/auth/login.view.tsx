import React from 'react';
import { Form, Input, Button, Card, Typography, Layout } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useLoginPresenter } from './login.presenter';

const { Title, Text } = Typography;

export const LoginView: React.FC = () => {
  const { loading, handleLogin } = useLoginPresenter();

  return (
    <Layout style={{ minHeight: '100vh', flexDirection: 'row', background: '#0f172a' }}>
      {/* Visual Left Banner (Desktop only) */}
      <div
        className="login-banner"
        style={{
          flex: 1,
          background: 'linear-gradient(135deg, #1e1b4b 0%, #311042 50%, #030712 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '48px',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Glow dots decorations */}
        <div style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(99,102,241,0) 70%)',
          top: '-50px',
          left: '-50px',
        }} />
        <div style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(236,72,153,0.1) 0%, rgba(236,72,153,0) 70%)',
          bottom: '-100px',
          right: '-50px',
        }} />

        <div style={{ zIndex: 2, maxWidth: '480px', textAlign: 'center' }}>
          <Title level={1} style={{ color: '#ffffff', fontSize: '3rem', fontWeight: 800, margin: 0, letterSpacing: '-0.05em' }}>
            POS<span style={{ color: '#6366f1' }}>UMKM</span>
          </Title>
          <Title level={4} style={{ color: '#94a3b8', fontWeight: 400, marginTop: '12px', marginBottom: '32px' }}>
            Kelola transaksi kasir dan produk usaha mikro Anda dengan cepat, efisien, dan modern.
          </Title>
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '24px', backdropFilter: 'blur(8px)' }}>
            <Text style={{ color: '#e2e8f0', display: 'block', fontSize: '0.95rem' }}>
              "Aplikasi POS ini dirancang khusus untuk mempermudah operasional kasir harian dan inventory tracking bagi UMKM Indonesia."
            </Text>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '40px',
          background: '#0f172a',
        }}
      >
        <Card
          bordered={false}
          style={{
            background: 'transparent',
            boxShadow: 'none',
          }}
          bodyStyle={{ padding: 0 }}
        >
          <div style={{ marginBottom: '40px' }}>
            <Title level={2} style={{ color: '#ffffff', fontWeight: 700, margin: 0 }}>
              Selamat Datang
            </Title>
            <Text style={{ color: '#64748b' }}>Silakan masuk ke akun Backoffice Anda</Text>
          </div>

          <Form
            name="login_form"
            layout="vertical"
            initialValues={{ remember: true }}
            onFinish={handleLogin}
            requiredMark={false}
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: 'Username tidak boleh kosong!' }]}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#64748b' }} />}
                placeholder="Username"
                size="large"
                style={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  color: '#ffffff',
                  borderRadius: '8px',
                  height: '48px',
                }}
                className="custom-input"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Password tidak boleh kosong!' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#64748b' }} />}
                placeholder="Password"
                size="large"
                style={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  color: '#ffffff',
                  borderRadius: '8px',
                  height: '48px',
                }}
              />
            </Form.Item>

            <Form.Item style={{ marginTop: '32px' }}>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loading}
                block
                style={{
                  height: '48px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.4)',
                }}
              >
                Masuk
              </Button>
            </Form.Item>
          </Form>

          {/* Quick Demo Info */}
          <div style={{ marginTop: '40px', padding: '16px', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '8px', border: '1px solid #334155' }}>
            <Text style={{ color: '#64748b', fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>Demo Credentials:</Text>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Admin: <strong>admin</strong> / admin123</Text>
              <Text style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Kasir: <strong>kasir</strong> / kasir123</Text>
            </div>
          </div>
        </Card>
      </div>

      <style>{`
        .custom-input::placeholder {
          color: #64748b !important;
        }
        .ant-input-password-icon {
          color: #64748b !important;
        }
        .ant-input-affix-wrapper:hover, .ant-input-affix-wrapper-focused {
          border-color: #6366f1 !important;
        }
        .ant-input-affix-wrapper input {
          color: #ffffff !important;
          background: transparent !important;
        }
        @media (max-width: 768px) {
          .login-banner {
            display: none !important;
          }
        }
      `}</style>
    </Layout>
  );
};
