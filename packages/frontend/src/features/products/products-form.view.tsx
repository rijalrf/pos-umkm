import React, { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Select, Upload, Button, message, Row, Col } from 'antd';
import type { InputRef } from 'antd';
import { InboxOutlined, DeleteOutlined } from '@ant-design/icons';
import type { RcFile } from 'antd/es/upload/interface';
import { useProductFormPresenter } from './products-form.presenter';
import { FormModal } from '../../components/common/form-modal.component';
import { ProductPayload, ProductItem } from './products.types';

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
  const { confirmLoading, handleSubmit } = useProductFormPresenter();

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<RcFile | null>(null);

  const kodeInputRef = React.createRef<InputRef>();

  useEffect(() => {
    if (open) {
      setPreviewUrl(null);
      setSelectedFile(null);
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

      setTimeout(() => {
        kodeInputRef.current?.focus();
      }, 100);
    }
  }, [open, editingProduct, form]);

  const handleBeforeUpload = (file: RcFile) => {
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

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setSelectedFile(file);

    return false;
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const payload: ProductPayload = {
        name: values.name,
        sku: values.sku,
        categoryId: values.categoryId,
        price: values.price,
        stock: values.stock,
        stockAlertThreshold: values.stockAlertThreshold,
        description: values.description,
      };
      await handleSubmit(payload, editingProduct, selectedFile, onSuccess);
    } catch {
      // Validation error - do nothing
    }
  };

  return (
    <FormModal
      title={editingProduct ? 'Edit Produk' : 'Tambah Produk'}
      open={open}
      onCancel={onCancel}
      onSubmit={handleOk}
      loading={confirmLoading}
      submitText={editingProduct ? 'Simpan Perubahan' : 'Buat Baru'}
      width={850}
    >
      <Form form={form} layout="vertical" className="form-container">
        <Row gutter={24}>
          <Col span={14}>
            <Form.Item
              name="sku"
              label="Kode"
              rules={[{ required: true, message: 'Kode wajib diisi!' }]}
            >
              <Input ref={kodeInputRef} placeholder="Contoh: SKU-MAK-001" className="input-medium" />
            </Form.Item>

            <Form.Item
              name="name"
              label="Nama Produk"
              rules={[{ required: true, message: 'Nama produk wajib diisi!' }]}
            >
              <Input placeholder="Contoh: Nasi Goreng Spesial" className="input-medium" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="categoryId"
                  label="Kategori"
                  rules={[{ required: true, message: 'Kategori wajib diisi!' }]}
                >
                  <Select placeholder="Pilih Kategori" className="input-medium">
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
                  label="Harga (Rp)"
                  rules={[{ required: true, message: 'Harga wajib diisi!' }]}
                >
                  <InputNumber
                    className="w-full input-medium"
                    min={0}
                    formatter={(value) => `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => Number(value!.replace(/Rp\s?|(,*)/g, '')) as unknown as 0}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="stock"
                  label="Stok"
                  rules={[{ required: true, message: 'Jumlah stok wajib diisi!' }]}
                >
                  <InputNumber className="w-full input-medium" min={0} precision={0} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="stockAlertThreshold"
                  label="Batas Minimum Stok"
                  tooltip="Ketika stok turun di bawah angka ini, sistem akan menandainya sebagai stok rendah."
                  initialValue={10}
                >
                  <InputNumber className="w-full input-medium" min={0} precision={0} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="description"
              label="Deskripsi"
            >
              <Input.TextArea placeholder="Masukkan deskripsi produk..." rows={3} />
            </Form.Item>
          </Col>

          <Col span={10}>
            <Form.Item label="Gambar Produk">
              <div className="upload-wrapper">
                {previewUrl ? (
                  <div className="image-preview-container">
                    <img src={previewUrl} alt="Product" className="image-preview" />
                    <Button
                      type="primary"
                      danger
                      icon={<DeleteOutlined />}
                      shape="circle"
                      size="middle"
                      onClick={handleRemoveImage}
                      className="image-remove-btn"
                    />
                  </div>
                ) : (
                  <Upload.Dragger
                    accept="image/*"
                    beforeUpload={handleBeforeUpload}
                    showUploadList={false}
                    className="upload-dragger-custom"
                  >
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">
                      Klik atau seret gambar ke sini
                    </p>
                    <p className="ant-upload-hint">
                      PNG, JPG maksimal 5MB
                    </p>
                  </Upload.Dragger>
                )}
              </div>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </FormModal>
  );
};
