import React, { useEffect, useState, useRef } from 'react';
import { Modal, Form, Input, InputNumber, Select, Upload, Button, message, Row, Col } from 'antd';
import { InboxOutlined, DeleteOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import { ProductsService, ProductPayload } from './products.service';
import { ProductItem } from './products.presenter';

interface ProductFormModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  editingProduct: ProductItem | null;
  categories: { id: string; name: string }[];
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  open,
  onCancel,
  onSuccess,
  editingProduct,
  categories,
}) => {
  const [form] = Form.useForm();
  const [confirmLoading, setConfirmLoading] = useState(false);
  
  // Image Upload states
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Focus ref
  const kodeInputRef = useRef<any>(null);

  useEffect(() => {
    if (open) {
      setFileList([]);
      setPreviewUrl(null);
      if (editingProduct) {
        form.setFieldsValue({
          name: editingProduct.name,
          sku: editingProduct.sku,
          categoryId: editingProduct.categoryId,
          price: parseFloat(editingProduct.price),
          stock: editingProduct.stock,
          stockAlertThreshold: editingProduct.stockAlertThreshold,
          description: editingProduct.description,
        });
        if (editingProduct.imageUrl) {
          setPreviewUrl(editingProduct.imageUrl);
        }
      } else {
        form.resetFields();
      }

      // Auto-focus Kode input field
      setTimeout(() => {
        kodeInputRef.current?.focus();
      }, 100);
    }
  }, [open, editingProduct, form]);

  const handleBeforeUpload = (file: File) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('Anda hanya dapat mengunggah file JPG/PNG!');
      return Upload.LIST_IGNORE;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Ukuran gambar tidak boleh lebih dari 5MB!');
      return Upload.LIST_IGNORE;
    }
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setFileList([{
      uid: '-1',
      name: file.name,
      status: 'done',
      originFileObj: file as any,
    }]);

    return false; // Stop auto-upload
  };

  const handleRemoveImage = () => {
    setFileList([]);
    setPreviewUrl(null);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setConfirmLoading(true);

      const payload: ProductPayload = {
        name: values.name,
        sku: values.sku,
        categoryId: values.categoryId,
        price: values.price,
        stock: values.stock,
        stockAlertThreshold: values.stockAlertThreshold,
        description: values.description,
      };

      let productId = '';
      let isUpdate = false;

      if (editingProduct) {
        isUpdate = true;
        productId = editingProduct.id;
        const response = await ProductsService.update(productId, payload);
        if (!response.success) {
          throw new Error(response.message || 'Gagal memperbarui produk');
        }
      } else {
        const response = await ProductsService.create(payload);
        if (response.success && response.data) {
          productId = response.data.id;
        } else {
          throw new Error(response.message || 'Gagal menambahkan produk');
        }
      }

      // Handle image upload if a file is selected
      if (fileList.length > 0 && fileList[0]?.originFileObj && productId) {
        try {
          message.loading({ content: 'Mengunggah gambar...', key: 'uploading' });
          const uploadRes = await ProductsService.uploadImage(productId, fileList[0].originFileObj as File);
          if (uploadRes.success) {
            message.success({ content: 'Gambar berhasil diunggah!', key: 'uploading' });
          } else {
            message.warning({ content: 'Produk berhasil disimpan, tetapi gagal mengunggah gambar', key: 'uploading' });
          }
        } catch (uploadError) {
          console.error(uploadError);
          message.warning({ content: 'Produk berhasil disimpan, tetapi gagal mengunggah gambar', key: 'uploading' });
        }
      }

      message.success(`Produk berhasil ${isUpdate ? 'diperbarui' : 'ditambahkan'}`);
      onSuccess();
    } catch (error: any) {
      const errMsg = error.response?.data?.message || error.message || 'Terjadi kesalahan saat memproses data';
      message.error(errMsg);
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <Modal
      title={<span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, color: '#C2410C' }}>{editingProduct ? 'Edit Produk' : 'Tambah Produk'}</span>}
      open={open}
      onOk={handleOk}
      confirmLoading={confirmLoading}
      onCancel={onCancel}
      destroyOnClose
      width={850}
    >
      <Form form={form} layout="vertical" style={{ marginTop: '16px' }}>
        <Row gutter={24}>
          {/* Left Column: All Input Fields */}
          <Col span={14}>
            <Form.Item
              name="sku"
              label={<span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: '13px', color: '#1C1917' }}>Kode</span>}
              rules={[{ required: true, message: 'Kode wajib diisi!' }]}
            >
              <Input ref={kodeInputRef} placeholder="Contoh: SKU-MAK-001" style={{ height: '42px', borderRadius: '4px' }} />
            </Form.Item>

            <Form.Item
              name="name"
              label={<span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: '13px', color: '#1C1917' }}>Nama Produk</span>}
              rules={[{ required: true, message: 'Nama produk wajib diisi!' }]}
            >
              <Input placeholder="Contoh: Nasi Goreng Spesial" style={{ height: '42px', borderRadius: '4px' }} />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="categoryId"
                  label={<span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: '13px', color: '#1C1917' }}>Kategori</span>}
                  rules={[{ required: true, message: 'Kategori wajib diisi!' }]}
                >
                  <Select placeholder="Pilih Kategori" style={{ height: '42px', borderRadius: '4px' }}>
                    {categories.map((cat) => (
                      <Select.Option key={cat.id} value={cat.id}>
                        {cat.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="price"
                  label={<span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: '13px', color: '#1C1917' }}>Harga (Rp)</span>}
                  rules={[{ required: true, message: 'Harga wajib diisi!' }]}
                >
                  <InputNumber
                    style={{ width: '100%', height: '42px', display: 'flex', alignItems: 'center', borderRadius: '4px' }}
                    min={0}
                    formatter={(value) => `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value!.replace(/Rp\s?|(,*)/g, '') as any}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="stock"
                  label={<span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: '13px', color: '#1C1917' }}>Stok</span>}
                  rules={[{ required: true, message: 'Jumlah stok wajib diisi!' }]}
                >
                  <InputNumber style={{ width: '100%', height: '42px', display: 'flex', alignItems: 'center', borderRadius: '4px' }} min={0} precision={0} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="stockAlertThreshold"
                  label={<span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: '13px', color: '#1C1917' }}>Batas Minimum Stok</span>}
                  tooltip="Ketika stok turun di bawah angka ini, sistem akan menandainya sebagai stok rendah."
                  initialValue={10}
                >
                  <InputNumber style={{ width: '100%', height: '42px', display: 'flex', alignItems: 'center', borderRadius: '4px' }} min={0} precision={0} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="description"
              label={<span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: '13px', color: '#1C1917' }}>Deskripsi</span>}
              style={{ marginBottom: 0 }}
            >
              <Input.TextArea placeholder="Masukkan deskripsi produk..." rows={3} style={{ borderRadius: '4px' }} />
            </Form.Item>
          </Col>

          {/* Right Column: Image Frame Upload & Preview */}
          <Col span={10}>
            <Form.Item
              label={<span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: '13px', color: '#1C1917' }}>Gambar Produk</span>}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {previewUrl ? (
                  <div style={{ position: 'relative', width: '100%', height: '445px', border: '1px solid #D6D3D1', borderRadius: '8px', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFBF5' }}>
                    <img src={previewUrl} alt="Product" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <Button
                      type="primary"
                      danger
                      icon={<DeleteOutlined />}
                      shape="circle"
                      size="middle"
                      onClick={handleRemoveImage}
                      style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 10 }}
                    />
                  </div>
                ) : (
                  <Upload.Dragger
                    accept="image/*"
                    beforeUpload={handleBeforeUpload}
                    showUploadList={false}
                    style={{
                      border: '1.5px dashed #D6D3D1',
                      borderRadius: '8px',
                      height: '445px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      backgroundColor: '#FFFBF5',
                    }}
                  >
                    <p className="ant-upload-drag-icon" style={{ margin: 0 }}>
                      <InboxOutlined style={{ color: '#C2410C', fontSize: '48px' }} />
                    </p>
                    <p className="ant-upload-text" style={{ fontSize: '14px', margin: '12px 0 0 0', color: '#1C1917', fontWeight: 600 }}>
                      Klik atau seret gambar ke sini
                    </p>
                    <p className="ant-upload-hint" style={{ fontSize: '12px', color: '#57534E', marginTop: '4px' }}>
                      PNG, JPG maksimal 5MB
                    </p>
                  </Upload.Dragger>
                )}
              </div>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};
