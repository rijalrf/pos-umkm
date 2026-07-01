import React, { useEffect, useState } from 'react';
import { Tabs, Form, Input, Button, Space, Typography, Badge, message, Upload, Spin, Card } from 'antd';
import { SettingOutlined, GoogleOutlined, CheckCircleOutlined, CloseCircleOutlined, PlusOutlined, LoadingOutlined } from '@ant-design/icons';
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

  // Store Settings state
  const [storeLoading, setStoreLoading] = useState<boolean>(true);
  const [savingStore, setSavingStore] = useState<boolean>(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState<boolean>(false);

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

  // Load store settings
  const loadStoreSettings = async () => {
    setStoreLoading(true);
    try {
      const data = await presenter.getStoreSetting();
      formStore.setFieldsValue({
        storeName: data.storeName,
        phone: data.phone,
        email: data.email,
        address: data.address,
        currency: data.currency,
        timezone: data.timezone,
        dateFormat: data.dateFormat,
      });
      setLogoUrl(data.logoUrl);
    } catch (error: any) {
      message.error(error.message || 'Failed to load store settings');
    } finally {
      setStoreLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
    loadStoreSettings();

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

  const handleUpdateStore = async (values: any) => {
    setSavingStore(true);
    try {
      await presenter.updateStoreSetting(values);
      message.success('Store settings updated successfully');
    } catch (error: any) {
      message.error(error.message || 'Failed to update store settings');
    } finally {
      setSavingStore(false);
    }
  };

  const handleBeforeLogoUpload = (file: File) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG files!');
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Image must be smaller than 2MB!');
      return false;
    }
    return true;
  };

  const handleLogoUpload = async (file: File) => {
    setUploadingLogo(true);
    const key = 'logo-upload';
    message.loading({ content: 'Uploading logo to Google Drive...', key });
    try {
      const url = await presenter.uploadStoreLogo(file);
      setLogoUrl(url);
      message.success({ content: 'Logo uploaded successfully!', key });
    } catch (error: any) {
      message.error({ content: error.message || 'Failed to upload logo', key });
    } finally {
      setUploadingLogo(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ fontFamily: "'Inter', sans-serif", color: '#C2410C', margin: 0 }}>
          Pengaturan
        </Title>
        <Paragraph style={{ fontFamily: "'Inter', sans-serif", color: '#57534E', marginTop: '4px' }}>
          Konfigurasikan integrasi Google Drive untuk gambar produk dan sesuaikan profil toko.
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
                  <GoogleOutlined /> Integrasi Google Drive
                </span>
              ),
              children: (
                <div style={{ marginTop: '16px' }}>
                  <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFBF5', padding: '16px', border: '1px solid #E7E5E4', borderRadius: '4px' }}>
                    <Space size="middle">
                      <GoogleOutlined style={{ fontSize: '32px', color: '#C2410C' }} />
                      <div>
                        <Text strong style={{ display: 'block', fontSize: '16px' }}>Status Koneksi Google Drive</Text>
                        <Text type="secondary" style={{ fontSize: '13px' }}>
                          Digunakan untuk menyimpan dan menyajikan gambar produk secara aman.
                        </Text>
                      </div>
                    </Space>
                    <div>
                      {loadingStatus ? (
                        <Badge status="processing" text="Memeriksa status..." />
                      ) : gdriveConnected ? (
                        <Space>
                          <Badge status="success" />
                          <span style={{ color: '#166534', fontWeight: 600, backgroundColor: '#DCFCE7', padding: '4px 10px', borderRadius: '4px', border: '1px solid #BBF7D0', fontSize: '12px' }}>
                            <CheckCircleOutlined /> TERHUBUNG
                          </span>
                        </Space>
                      ) : (
                        <Space>
                          <Badge status="error" />
                          <span style={{ color: '#991B1B', fontWeight: 600, backgroundColor: '#FEE2E2', padding: '4px 10px', borderRadius: '4px', border: '1px solid #FCA5A5', fontSize: '12px' }}>
                            <CloseCircleOutlined /> BELUM TERHUBUNG
                          </span>
                        </Space>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div>
                      <Title level={4} style={{ fontFamily: "'Inter', sans-serif", margin: '0 0 16px 0', fontSize: '18px' }}>
                        Panduan Konfigurasi Langkah Demi Langkah
                      </Title>
                      <Paragraph style={{ fontSize: '14px', lineHeight: '1.6', color: '#57534E' }}>
                        1. Buka <strong><a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer">Google Cloud Console</a></strong>.<br />
                        2. Buat proyek baru atau pilih proyek yang sudah ada.<br />
                        3. Cari <strong>Google Drive API</strong> dan aktifkan.<br />
                        4. Buka <strong>OAuth consent screen</strong>, atur tipe sebagai Eksternal, dan tambahkan scope <code>.../auth/drive.file</code>.<br />
                        5. Buka <strong>Credentials</strong>, klik <i>Buat Kredensial</i> → <i>OAuth client ID</i> (Tipe aplikasi: Web application).<br />
                        6. Di bagian <strong>Authorized redirect URIs</strong>, tambahkan:
                        <pre style={{ backgroundColor: '#F5F5F4', padding: '8px', borderRadius: '4px', fontSize: '12px', marginTop: '6px', border: '1px solid #E7E5E4', overflowX: 'auto' }}>
                          http://localhost:3000/api/settings/gdrive/callback
                        </pre>
                        7. Salin client ID dan client secret, tempelkan di form dan klik <strong>Otorisasi</strong>.
                      </Paragraph>
                    </div>

                    <div style={{ borderLeft: '1px solid #E7E5E4', paddingLeft: '24px' }}>
                      <Title level={4} style={{ fontFamily: "'Inter', sans-serif", margin: '0 0 16px 0', fontSize: '18px' }}>
                        Kredensial Konfigurasi
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
                          rules={[{ required: true, message: 'Client ID wajib diisi!' }]}
                        >
                          <Input placeholder="Masukkan Google OAuth Client ID Anda" />
                        </Form.Item>

                        <Form.Item
                          name="clientSecret"
                          label={<span style={{ fontWeight: 600, fontSize: '13px', color: '#1C1917' }}>Client Secret</span>}
                          rules={[{ required: true, message: 'Client Secret wajib diisi!' }]}
                        >
                          <Input.Password placeholder="Masukkan Google OAuth Client Secret Anda" />
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
                              Uji Koneksi
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
                              Otorisasi
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
                  <SettingOutlined /> Profil Toko
                </span>
              ),
              children: (
                <Spin spinning={storeLoading} tip="Memuat pengaturan toko...">
                  <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '32px', marginTop: '16px' }}>
                    
                    {/* Left side: Logo Uploader */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Text strong style={{ display: 'block', marginBottom: '12px', fontSize: '13px', color: '#1C1917' }}>
                        Logo Toko
                      </Text>
                      <Upload
                        name="logo"
                        listType="picture-card"
                        className="avatar-uploader"
                        showUploadList={false}
                        beforeUpload={handleBeforeLogoUpload}
                        customRequest={({ file }) => handleLogoUpload(file as File)}
                        disabled={uploadingLogo}
                        style={{ width: '150px', height: '150px' }}
                      >
                        {logoUrl ? (
                          <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img 
                              src={logoUrl} 
                              alt="Store Logo" 
                              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '4px' }} 
                            />
                            {uploadingLogo && (
                              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <LoadingOutlined style={{ fontSize: 24, color: '#C2410C' }} />
                              </div>
                            )}
                          </div>
                        ) : (
                          <div style={{ padding: '8px', textAlign: 'center' }}>
                            {uploadingLogo ? <LoadingOutlined style={{ color: '#C2410C' }} /> : <PlusOutlined style={{ color: '#C2410C' }} />}
                            <div style={{ marginTop: 8, fontSize: '13px', color: '#57534E' }}>Unggah Logo</div>
                          </div>
                        )}
                      </Upload>
                      <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '12px', textAlign: 'center', color: '#78716C' }}>
                        Mendukung JPG/PNG.<br />Ukuran file maksimal 2MB.
                      </Text>
                    </div>

                    {/* Right side: Form settings */}
                    <div>
                      <Form
                        form={formStore}
                        layout="vertical"
                        onFinish={handleUpdateStore}
                        requiredMark={false}
                      >
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                          <Form.Item
                            name="storeName"
                            label={<span style={{ fontWeight: 600, fontSize: '13px', color: '#1C1917' }}>Nama Toko</span>}
                            rules={[{ required: true, message: 'Nama toko wajib diisi!' }]}
                          >
                            <Input />
                          </Form.Item>

                          <Form.Item
                            name="phone"
                            label={<span style={{ fontWeight: 600, fontSize: '13px', color: '#1C1917' }}>Nomor Telepon</span>}
                            rules={[{ required: true, message: 'Nomor telepon wajib diisi!' }]}
                          >
                            <Input />
                          </Form.Item>

                          <Form.Item
                            name="email"
                            label={<span style={{ fontWeight: 600, fontSize: '13px', color: '#1C1917' }}>Alamat Email</span>}
                          >
                            <Input type="email" />
                          </Form.Item>

                          <Form.Item
                            name="currency"
                            label={<span style={{ fontWeight: 600, fontSize: '13px', color: '#1C1917' }}>Simbol Mata Uang</span>}
                            rules={[{ required: true, message: 'Simbol mata uang wajib diisi!' }]}
                          >
                            <Input placeholder="Contoh: IDR, $, Rp" />
                          </Form.Item>

                          <Form.Item
                            name="dateFormat"
                            label={<span style={{ fontWeight: 600, fontSize: '13px', color: '#1C1917' }}>Format Tanggal</span>}
                            rules={[{ required: true, message: 'Format tanggal wajib diisi!' }]}
                          >
                            <Input placeholder="Contoh: DD/MM/YYYY" />
                          </Form.Item>

                          <Form.Item
                            name="timezone"
                            label={<span style={{ fontWeight: 600, fontSize: '13px', color: '#1C1917' }}>Zona Waktu</span>}
                            rules={[{ required: true, message: 'Zona waktu wajib diisi!' }]}
                          >
                            <Input placeholder="Contoh: Asia/Jakarta" />
                          </Form.Item>
                        </div>

                        <Form.Item
                          name="address"
                          label={<span style={{ fontWeight: 600, fontSize: '13px', color: '#1C1917' }}>Alamat Toko</span>}
                          rules={[{ required: true, message: 'Alamat toko wajib diisi!' }]}
                        >
                          <Input.TextArea rows={3} />
                        </Form.Item>

                        <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
                          <Button
                            type="primary"
                            htmlType="submit"
                            loading={savingStore}
                            style={{
                              backgroundColor: '#C2410C',
                              borderColor: '#C2410C',
                              height: '42px',
                              borderRadius: '4px',
                            }}
                          >
                            Simpan Pengaturan
                          </Button>
                        </Form.Item>
                      </Form>
                    </div>

                  </div>
                </Spin>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};
