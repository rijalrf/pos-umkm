import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Typography, message, Upload, Spin, Card, Select } from 'antd';
import { SettingOutlined, PlusOutlined, LoadingOutlined } from '@ant-design/icons';
import { SettingsPresenter } from './settings.presenter';

const { Title, Text } = Typography;

export const SettingsView: React.FC = () => {
  const presenter = new SettingsPresenter();

  // Store Settings state
  const [storeLoading, setStoreLoading] = useState<boolean>(true);
  const [savingStore, setSavingStore] = useState<boolean>(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState<boolean>(false);
  const [qrisUrl, setQrisUrl] = useState<string | null>(null);
  const [uploadingQris, setUploadingQris] = useState<boolean>(false);

  const [formStore] = Form.useForm();

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
      setQrisUrl(data.qrisUrl);
    } catch (error: any) {
      message.error(error.message || 'Failed to load store settings');
    } finally {
      setStoreLoading(false);
    }
  };

  useEffect(() => {
    loadStoreSettings();
  }, []);

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
    message.loading({ content: 'Mengunggah logo...', key });
    try {
      const data = await presenter.uploadStoreLogo(file);
      setLogoUrl(data.logoUrl);
      message.success({ content: 'Logo berhasil diunggah!', key });
    } catch (error: any) {
      message.error({ content: error.message || 'Gagal mengunggah logo', key });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleQrisUpload = async (file: File) => {
    setUploadingQris(true);
    const key = 'qris-upload';
    message.loading({ content: 'Mengunggah gambar QRIS...', key });
    try {
      const data = await presenter.uploadStoreQris(file);
      setQrisUrl(data.qrisUrl);
      message.success({ content: 'QRIS berhasil diunggah!', key });
    } catch (error: any) {
      message.error({ content: error.message || 'Gagal mengunggah QRIS', key });
    } finally {
      setUploadingQris(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ fontFamily: "'Inter', sans-serif", color: '#C2410C', margin: 0 }}>
          Pengaturan Aplikasi
        </Title>
      </div>

      <Card
        style={{
          border: '1px solid #E7E5E4',
          borderRadius: '8px',
          backgroundColor: '#FFFFFF',
        }}
        bodyStyle={{ padding: '24px' }}
      >
        <div style={{ marginBottom: '16px', borderBottom: '1px solid #E7E5E4', paddingBottom: '12px' }}>
          <span style={{ fontSize: '16px', fontWeight: 600, color: '#C2410C', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SettingOutlined /> Profil & Pengaturan Toko
          </span>
        </div>

        <Spin spinning={storeLoading} tip="Memuat pengaturan toko...">
          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '32px', marginTop: '16px' }}>
            
            {/* Left side: Logo & QRIS Uploaders */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
              {/* Logo Toko */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
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
                <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginTop: '8px', textAlign: 'center', color: '#78716C' }}>
                  Mendukung JPG/PNG. Maksimal 2MB.
                </Text>
              </div>

              {/* QRIS Toko */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', borderTop: '1px solid #E7E5E4', paddingTop: '20px' }}>
                <Text strong style={{ display: 'block', marginBottom: '12px', fontSize: '13px', color: '#1C1917' }}>
                  QRIS Toko
                </Text>
                <Upload
                  name="qris"
                  listType="picture-card"
                  className="avatar-uploader"
                  showUploadList={false}
                  beforeUpload={handleBeforeLogoUpload}
                  customRequest={({ file }) => handleQrisUpload(file as File)}
                  disabled={uploadingQris}
                  style={{ width: '150px', height: '150px' }}
                >
                  {qrisUrl ? (
                    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img 
                        src={qrisUrl} 
                        alt="Store QRIS" 
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '4px' }} 
                      />
                      {uploadingQris && (
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <LoadingOutlined style={{ fontSize: 24, color: '#C2410C' }} />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ padding: '8px', textAlign: 'center' }}>
                      {uploadingQris ? <LoadingOutlined style={{ color: '#C2410C' }} /> : <PlusOutlined style={{ color: '#C2410C' }} />}
                      <div style={{ marginTop: 8, fontSize: '13px', color: '#57534E' }}>Unggah QRIS</div>
                    </div>
                  )}
                </Upload>
                <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginTop: '8px', textAlign: 'center', color: '#78716C' }}>
                  Mendukung JPG/PNG. Maksimal 2MB.
                </Text>
              </div>
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
                    <Select placeholder="Pilih Simbol Mata Uang">
                      <Select.Option value="Rp">Rp (Rupiah)</Select.Option>
                      <Select.Option value="IDR">IDR</Select.Option>
                      <Select.Option value="$">$ (USD)</Select.Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="dateFormat"
                    label={<span style={{ fontWeight: 600, fontSize: '13px', color: '#1C1917' }}>Format Tanggal</span>}
                    rules={[{ required: true, message: 'Format tanggal wajib diisi!' }]}
                  >
                    <Select placeholder="Pilih Format Tanggal">
                      <Select.Option value="DD/MM/YYYY">DD/MM/YYYY</Select.Option>
                      <Select.Option value="DD-MM-YYYY">DD-MM-YYYY</Select.Option>
                      <Select.Option value="YYYY-MM-DD">YYYY-MM-DD</Select.Option>
                      <Select.Option value="DD MMM YYYY">DD MMM YYYY</Select.Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="timezone"
                    label={<span style={{ fontWeight: 600, fontSize: '13px', color: '#1C1917' }}>Zona Waktu</span>}
                    rules={[{ required: true, message: 'Zona waktu wajib diisi!' }]}
                  >
                    <Select placeholder="Pilih Zona Waktu">
                      <Select.Option value="Asia/Jakarta">WIB (Asia/Jakarta)</Select.Option>
                      <Select.Option value="Asia/Makassar">WITA (Asia/Makassar)</Select.Option>
                      <Select.Option value="Asia/Jayapura">WIT (Asia/Jayapura)</Select.Option>
                    </Select>
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
      </Card>
    </div>
  );
};
