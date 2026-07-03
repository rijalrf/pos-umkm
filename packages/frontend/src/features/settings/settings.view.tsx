import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Typography, message, Upload, Spin, Card, Select } from 'antd';
import { SettingOutlined, PlusOutlined, LoadingOutlined } from '@ant-design/icons';
import { SettingsPresenter } from './settings.presenter';
import { StoreSettingsPayload } from './settings.types';
import { AxiosError } from 'axios';

const { Title, Text } = Typography;

export const SettingsView: React.FC = () => {
  const presenter = new SettingsPresenter();

  const [storeLoading, setStoreLoading] = useState(true);
  const [savingStore, setSavingStore] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [qrisUrl, setQrisUrl] = useState<string | null>(null);
  const [uploadingQris, setUploadingQris] = useState(false);

  const [formStore] = Form.useForm();

  const handleError = (error: unknown, defaultMsg: string) => {
    const msg = error instanceof AxiosError ? error.response?.data?.message : error instanceof Error ? error.message : defaultMsg;
    message.error(msg);
  };

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
    } catch (error: unknown) {
      handleError(error, 'Failed to load store settings');
    } finally {
      setStoreLoading(false);
    }
  };

  useEffect(() => {
    loadStoreSettings();
  }, []);

  const handleUpdateStore = async (values: Record<string, unknown>) => {
    setSavingStore(true);
    try {
      await presenter.updateStoreSetting(values as unknown as StoreSettingsPayload);
      message.success('Store settings updated successfully');
    } catch (error: unknown) {
      handleError(error, 'Failed to update store settings');
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
    } catch (error: unknown) {
      handleError(error, 'Gagal mengunggah logo');
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
    } catch (error: unknown) {
      handleError(error, 'Gagal mengunggah QRIS');
    } finally {
      setUploadingQris(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <Title level={2} className="page-title">Pengaturan Aplikasi</Title>
      </div>

      <Card className="card-filter">
        <div className="settings-section-header">
          <span className="settings-section-title">
            <SettingOutlined /> Profil & Pengaturan Toko
          </span>
        </div>

        <Spin spinning={storeLoading} tip="Memuat pengaturan toko...">
          <div className="settings-layout">
            <div className="settings-uploads">
              <div className="settings-upload-item">
                <Text strong className="settings-upload-label">Logo Toko</Text>
                <Upload
                  name="logo"
                  listType="picture-card"
                  className="avatar-uploader"
                  showUploadList={false}
                  beforeUpload={handleBeforeLogoUpload}
                  customRequest={({ file }) => handleLogoUpload(file as File)}
                  disabled={uploadingLogo}
                >
                  {logoUrl ? (
                    <div className="upload-preview">
                      <img src={logoUrl} alt="Store Logo" className="upload-preview-img" />
                      {uploadingLogo && (
                        <div className="upload-overlay">
                          <LoadingOutlined />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      {uploadingLogo ? <LoadingOutlined /> : <PlusOutlined />}
                      <div className="upload-placeholder-text">Unggah Logo</div>
                    </div>
                  )}
                </Upload>
                <Text type="secondary" className="upload-hint">
                  Mendukung JPG/PNG. Maksimal 2MB.
                </Text>
              </div>

              <div className="settings-upload-item settings-upload-divider">
                <Text strong className="settings-upload-label">QRIS Toko</Text>
                <Upload
                  name="qris"
                  listType="picture-card"
                  className="avatar-uploader"
                  showUploadList={false}
                  beforeUpload={handleBeforeLogoUpload}
                  customRequest={({ file }) => handleQrisUpload(file as File)}
                  disabled={uploadingQris}
                >
                  {qrisUrl ? (
                    <div className="upload-preview">
                      <img src={qrisUrl} alt="Store QRIS" className="upload-preview-img" />
                      {uploadingQris && (
                        <div className="upload-overlay">
                          <LoadingOutlined />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      {uploadingQris ? <LoadingOutlined /> : <PlusOutlined />}
                      <div className="upload-placeholder-text">Unggah QRIS</div>
                    </div>
                  )}
                </Upload>
                <Text type="secondary" className="upload-hint">
                  Mendukung JPG/PNG. Maksimal 2MB.
                </Text>
              </div>
            </div>

            <div className="settings-form">
              <Form
                form={formStore}
                layout="vertical"
                onFinish={handleUpdateStore}
                requiredMark={false}
              >
                <div className="settings-form-grid">
                  <Form.Item
                    name="storeName"
                    label="Nama Toko"
                    rules={[{ required: true, message: 'Nama toko wajib diisi!' }]}
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item
                    name="phone"
                    label="Nomor Telepon"
                    rules={[{ required: true, message: 'Nomor telepon wajib diisi!' }]}
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item
                    name="email"
                    label="Alamat Email"
                  >
                    <Input type="email" />
                  </Form.Item>

                  <Form.Item
                    name="currency"
                    label="Simbol Mata Uang"
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
                    label="Format Tanggal"
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
                    label="Zona Waktu"
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
                  label="Alamat Toko"
                  rules={[{ required: true, message: 'Alamat toko wajib diisi!' }]}
                >
                  <Input.TextArea rows={3} />
                </Form.Item>

                <Form.Item className="form-actions-right">
                  <Button type="primary" htmlType="submit" loading={savingStore} className="btn-primary-terracotta">
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
