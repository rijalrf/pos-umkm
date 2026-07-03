import React from 'react';
import { Form, Input, Button, Typography, Layout } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useLoginPresenter } from './auth-login.presenter';

const { Title, Text } = Typography;

export const LoginView: React.FC = () => {
  const { loading, handleLogin, storeInfo } = useLoginPresenter();
  const displayName = storeInfo?.storeName || 'POS UMKM';

  return (
    <Layout style={{ minHeight: '100vh', flexDirection: 'row', background: '#FFFBF5' }}>
      {/* Visual Left Banner (Desktop only) */}
      <div
        className="login-banner"
        style={{
          flex: 1,
          background: 'linear-gradient(135deg, #7c2d12 0%, #C2410C 60%, #D4A373 100%)',
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
          background: 'radial-gradient(circle, rgba(255,255,245,0.15) 0%, rgba(255,255,245,0) 70%)',
          top: '-50px',
          left: '-50px',
        }} />
        <div style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212,163,115,0.1) 0%, rgba(212,163,115,0) 70%)',
          bottom: '-100px',
          right: '-50px',
        }} />

        <div style={{ zIndex: 2, maxWidth: '480px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {storeInfo?.logoUrl ? (
            <img
              src={storeInfo.logoUrl}
              alt={displayName}
              style={{
                height: '80px',
                marginBottom: '20px',
                objectFit: 'contain',
                borderRadius: '8px',
                border: '2px solid rgba(255,255,255,0.2)',
                padding: '4px',
                background: 'rgba(255,255,255,0.1)'
              }}
            />
          ) : null}
          <Title level={1} style={{ color: '#ffffff', fontFamily: "'Inter', sans-serif", fontSize: '3rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
            {displayName}
          </Title>
          {storeInfo?.address && (
            <div style={{ marginTop: '32px', background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '12px', padding: '24px', backdropFilter: 'blur(8px)', width: '100%' }}>
              <Text style={{ color: '#FFFBF5', display: 'block', fontSize: '0.95rem', fontFamily: "'Inter', sans-serif", opacity: 0.9, lineHeight: '1.6' }}>
                {storeInfo.address}
              </Text>
              {storeInfo.phone && (
                <Text style={{ color: '#FFFBF5', display: 'block', fontSize: '0.9rem', fontFamily: "'Inter', sans-serif", opacity: 0.8, marginTop: '12px' }}>
                  Hubungi: {storeInfo.phone}
                </Text>
              )}
            </div>
          )}
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
          background: '#FFFBF5',
          borderLeft: '1px solid #E7E5E4',
        }}
      >
        <div style={{ marginBottom: '40px' }}>
          <Title level={2} style={{ color: '#C2410C', fontFamily: "'Inter', sans-serif", fontWeight: 700, margin: 0 }}>
            Selamat Datang
          </Title>
          <Text style={{ color: '#57534E', fontFamily: "'Inter', sans-serif" }}>Masuk ke Aplikasi {displayName}</Text>
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
            label={<span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: '13px', color: '#1C1917' }}>Username</span>}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#A8A29E' }} />}
              placeholder="Masukkan username"
              size="large"
              style={{
                background: '#FFFFFF',
                border: '1.5px solid #D6D3D1',
                color: '#1C1917',
                borderRadius: '4px',
                height: '42px',
              }}
              className="custom-input"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Password tidak boleh kosong!' }]}
            label={<span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: '13px', color: '#1C1917' }}>Password</span>}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#A8A29E' }} />}
              placeholder="Masukkan password"
              size="large"
              style={{
                background: '#FFFFFF',
                border: '1.5px solid #D6D3D1',
                color: '#1C1917',
                borderRadius: '4px',
                height: '42px',
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
                height: '42px',
                borderRadius: '4px',
                background: '#C2410C',
                border: 'none',
                fontWeight: 600,
                fontSize: '15px',
              }}
            >
              Masuk
            </Button>
          </Form.Item>
        </Form>

        {/* Quick Demo Info */}
        <div style={{ marginTop: '40px', padding: '16px', background: '#FFFFFF', borderRadius: '8px', border: '1px solid #E7E5E4' }}>
          <Text style={{ color: '#57534E', fontSize: '0.8rem', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Demo Credentials:</Text>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <Text style={{ color: '#57534E', fontSize: '0.8rem' }}>Admin: <strong style={{ color: '#C2410C' }}>admin</strong> / admin123</Text>
            <Text style={{ color: '#57534E', fontSize: '0.8rem' }}>Kasir: <strong style={{ color: '#C2410C' }}>kasir</strong> / kasir123</Text>
          </div>
        </div>
      </div>

      <style>{`
        .custom-input::placeholder {
          color: #A8A29E !important;
        }
        .ant-input-password-icon {
          color: #A8A29E !important;
        }
        .ant-input-affix-wrapper:hover, .ant-input-affix-wrapper-focused {
          border-color: #C2410C !important;
          box-shadow: 3px solid rgba(194, 65, 12, 0.15) !important;
        }
        .ant-input-affix-wrapper input {
          color: #1C1917 !important;
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

