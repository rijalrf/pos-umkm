import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Select, Upload, Button, message } from 'antd';
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
    }
  }, [open, editingProduct, form]);

  const handleBeforeUpload = (file: File) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG files!');
      return Upload.LIST_IGNORE;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Image must be smaller than 5MB!');
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
          throw new Error(response.message || 'Failed to update product');
        }
      } else {
        const response = await ProductsService.create(payload);
        if (response.success && response.data) {
          productId = response.data.id;
        } else {
          throw new Error(response.message || 'Failed to create product');
        }
      }

      // Handle image upload if a file is selected
      if (fileList.length > 0 && fileList[0]?.originFileObj && productId) {
        try {
          message.loading({ content: 'Uploading image to Google Drive...', key: 'uploading' });
          const uploadRes = await ProductsService.uploadImage(productId, fileList[0].originFileObj as File);
          if (uploadRes.success) {
            message.success({ content: 'Image uploaded successfully!', key: 'uploading' });
          } else {
            message.warning({ content: 'Product saved, but image upload failed', key: 'uploading' });
          }
        } catch (uploadError) {
          console.error(uploadError);
          message.warning({ content: 'Product saved, but image upload failed', key: 'uploading' });
        }
      }

      message.success(`Product ${isUpdate ? 'updated' : 'created'} successfully`);
      onSuccess();
    } catch (error: any) {
      const errMsg = error.response?.data?.message || error.message || 'Error processing request';
      message.error(errMsg);
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <Modal
      title={<span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, color: '#C2410C' }}>{editingProduct ? 'Edit Product' : 'Add Product'}</span>}
      open={open}
      onOk={handleOk}
      confirmLoading={confirmLoading}
      onCancel={onCancel}
      destroyOnClose
      width={600}
    >
      <Form form={form} layout="vertical" style={{ marginTop: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <Form.Item
              name="name"
              label={<span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: '13px', color: '#1C1917' }}>Product Name</span>}
              rules={[{ required: true, message: 'Please enter product name' }]}
            >
              <Input placeholder="e.g. Nasi Goreng Spesial" />
            </Form.Item>

            <Form.Item
              name="sku"
              label={<span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: '13px', color: '#1C1917' }}>SKU / Barcode</span>}
              rules={[{ required: true, message: 'Please enter SKU barcode code' }]}
            >
              <Input placeholder="e.g. FOOD-NSGR-01" />
            </Form.Item>

            <Form.Item
              name="categoryId"
              label={<span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: '13px', color: '#1C1917' }}>Category</span>}
              rules={[{ required: true, message: 'Please select a category' }]}
            >
              <Select placeholder="Select category">
                {categories.map((cat) => (
                  <Select.Option key={cat.id} value={cat.id}>
                    {cat.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="price"
              label={<span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: '13px', color: '#1C1917' }}>Price (IDR)</span>}
              rules={[{ required: true, message: 'Please enter price' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                formatter={(value) => `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value!.replace(/Rp\s?|(,*)/g, '') as any}
              />
            </Form.Item>
          </div>

          <div>
            <Form.Item
              name="stock"
              label={<span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: '13px', color: '#1C1917' }}>Stock</span>}
              rules={[{ required: true, message: 'Please enter stock quantity' }]}
            >
              <InputNumber style={{ width: '100%' }} min={0} precision={0} />
            </Form.Item>

            <Form.Item
              name="stockAlertThreshold"
              label={<span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: '13px', color: '#1C1917' }}>Stock Alert Threshold</span>}
              tooltip="When stock drops below this number, the system will highlight it as low stock."
              initialValue={10}
            >
              <InputNumber style={{ width: '100%' }} min={0} precision={0} />
            </Form.Item>

            {/* Product Image Section */}
            <Form.Item
              label={<span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: '13px', color: '#1C1917' }}>Product Image</span>}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {previewUrl ? (
                  <div style={{ position: 'relative', width: '100%', height: '140px', border: '1px solid #D6D3D1', borderRadius: '4px', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFBF5' }}>
                    <img src={previewUrl} alt="Product" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                    <Button
                      type="primary"
                      danger
                      icon={<DeleteOutlined />}
                      shape="circle"
                      size="small"
                      onClick={handleRemoveImage}
                      style={{ position: 'absolute', top: '8px', right: '8px' }}
                    />
                  </div>
                ) : (
                  <Upload.Dragger
                    accept="image/*"
                    beforeUpload={handleBeforeUpload}
                    showUploadList={false}
                    style={{
                      border: '1.5px dashed #D6D3D1',
                      borderRadius: '4px',
                      padding: '16px',
                      backgroundColor: '#FFFBF5',
                    }}
                  >
                    <p className="ant-upload-drag-icon" style={{ margin: 0 }}>
                      <InboxOutlined style={{ color: '#C2410C', fontSize: '28px' }} />
                    </p>
                    <p className="ant-upload-text" style={{ fontSize: '12px', margin: '4px 0 0 0', color: '#1C1917' }}>
                      Click or drag image here
                    </p>
                    <p className="ant-upload-hint" style={{ fontSize: '10px', color: '#57534E' }}>
                      PNG, JPG up to 5MB
                    </p>
                  </Upload.Dragger>
                )}
              </div>
            </Form.Item>
          </div>
        </div>

        <Form.Item
          name="description"
          label={<span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: '13px', color: '#1C1917' }}>Description</span>}
          style={{ marginBottom: 0 }}
        >
          <Input.TextArea placeholder="Enter product description" rows={3} />
        </Form.Item>
      </Form>
    </Modal>
  );
};
