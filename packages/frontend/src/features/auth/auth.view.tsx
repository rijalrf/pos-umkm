import React from "react";
import { Form, Input, Button, Typography, Layout, Flex } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useLoginPresenter } from "./auth.presenter";

const { Title, Text } = Typography;

export const LoginView: React.FC = () => {
  const presenter = useLoginPresenter();
  const displayName = presenter.storeInfo?.storeName || "POS UMKM";

  return (
    <Layout className="login-layout">
      {/* Visual Left Banner (Desktop only) */}
      <div className="login-banner">
        <div className="login-banner-content">
          {presenter.storeInfo?.logoUrl ? (
            <img
              src={presenter.storeInfo.logoUrl}
              alt={displayName}
              className="login-banner-logo"
            />
          ) : null}
          <Title level={1} className="login-banner-title">
            {displayName}
          </Title>
          {presenter.storeInfo?.address && (
            <div className="login-banner-address-card">
              <Text className="login-banner-address-text">
                {presenter.storeInfo.address}
              </Text>
              {presenter.storeInfo.phone && (
                <Text className="login-banner-phone-text">
                  Hubungi: {presenter.storeInfo.phone}
                </Text>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Form Container */}
      <div className="login-form-container">
        <div className="login-welcome-section">
          <Title level={2} className="login-welcome-title">
            Selamat Datang
          </Title>
          <Text className="login-welcome-text">
            Masuk ke Aplikasi {displayName}
          </Text>
        </div>

        <Form
          name="login_form"
          layout="vertical"
          initialValues={{ remember: true }}
          onFinish={presenter.handleLogin}
          requiredMark={false}
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: "Username tidak boleh kosong!" },
            ]}
            label={<span className="login-form-label">Username</span>}
          >
            <Input
              prefix={<UserOutlined className="login-input-prefix" />}
              placeholder="Masukkan username"
              size="large"
              className="login-input"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: "Password tidak boleh kosong!" },
            ]}
            label={<span className="login-form-label">Password</span>}
          >
            <Input.Password
              prefix={<LockOutlined className="login-input-prefix" />}
              placeholder="Masukkan password"
              size="large"
              className="login-input"
            />
          </Form.Item>

          <Form.Item className="login-submit-item">
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={presenter.loading}
              block
              className="login-submit-btn"
            >
              Masuk
            </Button>
          </Form.Item>
        </Form>

        {/* Quick Demo Info */}
        <div className="login-demo-box">
          <Text className="login-demo-label">Demo Credentials:</Text>
          <Flex vertical gap={4}>
            <Text className="login-demo-text">
              Admin: <strong className="login-demo-value">admin</strong> /
              admin123
            </Text>
            <Text className="login-demo-text">
              Kasir: <strong className="login-demo-value">kasir</strong> /
              kasir123
            </Text>
          </Flex>
        </div>
      </div>
    </Layout>
  );
};
