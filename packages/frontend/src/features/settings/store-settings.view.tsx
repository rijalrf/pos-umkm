import React, { useEffect, useState } from 'react';
import { Card, Tabs, Form, Input, Button, Space, Typography, Badge, message } from 'antd';
import { SettingOutlined, GoogleOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import { SettingsPresenter } from './settings.presenter';

const { Title, Text, Paragraph } = Typography;

export const SettingsView: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const presenter = new SettingsPresenter();

  const [gdriveConnected, setGdriveConnected] = useState<boolean>(false);
  const [loadingStatus, setLoadingStatus] = useState<boolean>(true);
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [testLoading, setTestLoading] = useState<boolean>(false);

  const [formGDrive] = Form.useForm();
  const [formStore] = Form.useForm();

  // Load connection status
  const checkStatus = async () => {
    try {
      const data = await presenter.getGDriveStatus();
      setGdriveConnected(data.isConnected);
    } catch (error: any) {
      message.error(error.message || 'Failed to fetch status');
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    checkStatus();

    // Check URL parameters for OAuth status
    const status = searchParams.get('gdrive');
    if (status === 'success') {
      message.success('Google Drive authorized and connected successfully!');
      setSearchParams({}); // Clear query params
    } else if (status === 'error') {
      const msg = searchParams.get('message') || 'Unknown error';
      message.error(`Authorization failed: ${decodeURIComponent(msg)}`);
      setSearchParams({}); // Clear query params
    }
  }, [searchParams]);

  const handleAuthorize = async (values: { clientId: string; clientSecret: string }) => {
    setAuthLoading(true);
    try {
      const data = await presenter.authorizeGDrive({
        clientId: values.clientId,
        clientSecret: values.clientSecret,
      });
      if (data.authUrl) {
        // Redirect user to Google OAuth page
        window.location.href = data.authUrl;
      } else {
        message.error('Failed to retrieve authorization URL');
      }
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setTestLoading(true);
    try {
      const data = await presenter.testGDriveConnection();
      if (data.isConnected) {
        setGdriveConnected(true);
        message.success('Google Drive connection test successful!');
      } else {
        setGdriveConnected(false);
        message.error('Connection test failed. Please verify credentials or re-authorize.');
      }
    } catch (error: any) {
      setGdriveConnected(false);
      message.error(error.message || 'Connection test failed.');
    } finally {
      setTestLoading(false);
    }
  };

  const handleUpdateStore = () => {
    message.success('Store settings updated successfully (Local Demo Mode)');
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '16px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ fontFamily: "'Playfair Display', serif", color: '#C2410C', margin: 0 }}>
          Settings
        </Title>
        <Paragraph style={{ fontFamily: "'Inter', sans-serif", color: '#57534E', marginTop: '4px' }}>
          Configure Google Drive integration for product images and modify store profile.
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
        <Tabs
          defaultActiveKey="gdrive"
          items={[
            {
              key: 'gdrive',
              label: (
                <span style={{ fontSize: '15px', fontWeight: 600 }}>
                  <GoogleOutlined /> Google Drive Integration
                </span>
              ),
              children: (
                <div style={{ marginTop: '16px' }}>
                  <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFBF5', padding: '16px', border: '1px solid #E7E5E4', borderRadius: '4px' }}>
                    <Space size="middle">
                      <GoogleOutlined style={{ fontSize: '32px', color: '#C2410C' }} />
                      <div>
                        <Text strong style={{ display: 'block', fontSize: '16px' }}>Google Drive Connection Status</Text>
                        <Text type="secondary" style={{ fontSize: '13px' }}>
                          Used to store and serve product images securely.
                        </Text>
                      </div>
                    </Space>
                    <div>
                      {loadingStatus ? (
                        <Badge status="processing" text="Checking status..." />
                      ) : gdriveConnected ? (
                        <Space>
                          <Badge status="success" />
                          <span style={{ color: '#166534', fontWeight: 600, backgroundColor: '#DCFCE7', padding: '4px 10px', borderRadius: '4px', border: '1px solid #BBF7D0', fontSize: '12px' }}>
                            <CheckCircleOutlined /> CONNECTED
                          </span>
                        </Space>
                      ) : (
                        <Space>
                          <Badge status="error" />
                          <span style={{ color: '#991B1B', fontWeight: 600, backgroundColor: '#FEE2E2', padding: '4px 10px', borderRadius: '4px', border: '1px solid #FCA5A5', fontSize: '12px' }}>
                            <CloseCircleOutlined /> NOT CONNECTED
                          </span>
                        </Space>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div>
                      <Title level={4} style={{ fontFamily: "'Playfair Display', serif", margin: '0 0 16px 0', fontSize: '18px' }}>
                        Step-by-step Setup Guide
                      </Title>
                      <Paragraph style={{ fontSize: '14px', lineHeight: '1.6', color: '#57534E' }}>
                        1. Go to the <strong><a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer">Google Cloud Console</a></strong>.<br />
                        2. Create a new project or select an existing one.<br />
                        3. Search for <strong>Google Drive API</strong> and enable it.<br />
                        4. Go to <strong>OAuth consent screen</strong>, set it up as External, and add scope <code>.../auth/drive.file</code>.<br />
                        5. Go to <strong>Credentials</strong>, click <i>Create Credentials</i> → <i>OAuth client ID</i> (Application type: Web application).<br />
                        6. Under <strong>Authorized redirect URIs</strong>, add:
                        <pre style={{ backgroundColor: '#F5F5F4', padding: '8px', borderRadius: '4px', fontSize: '12px', marginTop: '6px', border: '1px solid #E7E5E4', overflowX: 'auto' }}>
                          http://localhost:3000/api/settings/gdrive/callback
                        </pre>
                        7. Copy the client ID and client secret, paste them in the form and click <strong>Authorize</strong>.
                      </Paragraph>
                    </div>

                    <div style={{ borderLeft: '1px solid #E7E5E4', paddingLeft: '24px' }}>
                      <Title level={4} style={{ fontFamily: "'Playfair Display', serif", margin: '0 0 16px 0', fontSize: '18px' }}>
                        Configuration Credentials
                      </Title>

                      <Form
                        form={formGDrive}
                        layout="vertical"
                        onFinish={handleAuthorize}
                        requiredMark={false}
                      >
                        <Form.Item
                          name="clientId"
                          label={<span style={{ fontWeight: 600, fontSize: '13px', color: '#1C1917' }}>Client ID</span>}
                          rules={[{ required: true, message: 'Please enter Client ID' }]}
                        >
                          <Input placeholder="Enter your Google OAuth Client ID" />
                        </Form.Item>

                        <Form.Item
                          name="clientSecret"
                          label={<span style={{ fontWeight: 600, fontSize: '13px', color: '#1C1917' }}>Client Secret</span>}
                          rules={[{ required: true, message: 'Please enter Client Secret' }]}
                        >
                          <Input.Password placeholder="Enter your Google OAuth Client Secret" />
                        </Form.Item>

                        <Form.Item style={{ marginBottom: 0 }}>
                          <Space size="middle" style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <Button
                              type="default"
                              onClick={handleTestConnection}
                              loading={testLoading}
                              disabled={!gdriveConnected}
                              style={{
                                border: '1.5px solid #C2410C',
                                color: '#C2410C',
                                height: '42px',
                                borderRadius: '4px',
                              }}
                            >
                              Test Connection
                            </Button>
                            <Button
                              type="primary"
                              htmlType="submit"
                              loading={authLoading}
                              style={{
                                backgroundColor: '#C2410C',
                                borderColor: '#C2410C',
                                height: '42px',
                                borderRadius: '4px',
                              }}
                            >
                              Authorize
                            </Button>
                          </Space>
                        </Form.Item>
                      </Form>
                    </div>
                  </div>
                </div>
              ),
            },
            {
              key: 'store',
              label: (
                <span style={{ fontSize: '15px', fontWeight: 600 }}>
                  <SettingOutlined /> Store Settings
                </span>
              ),
              children: (
                <div style={{ marginTop: '16px' }}>
                  <Form
                    form={formStore}
                    layout="vertical"
                    onFinish={handleUpdateStore}
                    requiredMark={false}
                    initialValues={{
                      storeName: 'Toko Demo',
                      address: 'Jl. Contoh No. 123, Jakarta',
                      phone: '081234567890',
                      email: 'toko@example.com',
                      currency: 'IDR',
                      timezone: 'Asia/Jakarta',
                    }}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <Form.Item
                        name="storeName"
                        label={<span style={{ fontWeight: 600, fontSize: '13px', color: '#1C1917' }}>Store Name</span>}
                        rules={[{ required: true, message: 'Please enter store name' }]}
                      >
                        <Input />
                      </Form.Item>

                      <Form.Item
                        name="phone"
                        label={<span style={{ fontWeight: 600, fontSize: '13px', color: '#1C1917' }}>Phone Number</span>}
                        rules={[{ required: true, message: 'Please enter phone number' }]}
                      >
                        <Input />
                      </Form.Item>

                      <Form.Item
                        name="email"
                        label={<span style={{ fontWeight: 600, fontSize: '13px', color: '#1C1917' }}>Email Address</span>}
                      >
                        <Input type="email" />
                      </Form.Item>

                      <Form.Item
                        name="timezone"
                        label={<span style={{ fontWeight: 600, fontSize: '13px', color: '#1C1917' }}>Timezone</span>}
                      >
                        <Input disabled />
                      </Form.Item>
                    </div>

                    <Form.Item
                      name="address"
                      label={<span style={{ fontWeight: 600, fontSize: '13px', color: '#1C1917' }}>Store Address</span>}
                      rules={[{ required: true, message: 'Please enter address' }]}
                    >
                      <Input.TextArea rows={3} />
                    </Form.Item>

                    <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
                      <Button
                        type="primary"
                        htmlType="submit"
                        style={{
                          backgroundColor: '#C2410C',
                          borderColor: '#C2410C',
                          height: '42px',
                          borderRadius: '4px',
                        }}
                      >
                        Save Settings
                      </Button>
                    </Form.Item>
                  </Form>
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};
