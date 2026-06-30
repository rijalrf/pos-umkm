import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Select, message } from 'antd';
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

  useEffect(() => {
    if (open) {
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
      } else {
        form.resetFields();
      }
    }
  }, [open, editingProduct, form]);

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

      if (editingProduct) {
        const response = await ProductsService.update(editingProduct.id, payload);
        if (response.success) {
          message.success('Product updated successfully');
          onSuccess();
        } else {
          message.error(response.message || 'Failed to update product');
        }
      } else {
        const response = await ProductsService.create(payload);
        if (response.success) {
          message.success('Product created successfully');
          onSuccess();
        } else {
          message.error(response.message || 'Failed to create product');
        }
      }
    } catch (error: any) {
      const errMsg = error.response?.data?.message || 'Error processing request';
      message.error(errMsg);
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <Modal
      title={editingProduct ? 'Edit Product' : 'Add Product'}
      open={open}
      onOk={handleOk}
      confirmLoading={confirmLoading}
      onCancel={onCancel}
      destroyOnClose
    >
      <Form form={form} layout="vertical" style={{ marginTop: '16px' }}>
        <Form.Item
          name="name"
          label="Product Name"
          rules={[{ required: true, message: 'Please enter product name' }]}
        >
          <Input placeholder="e.g. Nasi Goreng Spesial" />
        </Form.Item>

        <Form.Item
          name="sku"
          label="SKU / Barcode"
          rules={[{ required: true, message: 'Please enter SKU barcode code' }]}
        >
          <Input placeholder="e.g. FOOD-NSGR-01" />
        </Form.Item>

        <Form.Item
          name="categoryId"
          label="Category"
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
          label="Price (IDR)"
          rules={[{ required: true, message: 'Please enter price' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            min={0}
            formatter={(value) => `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => value!.replace(/Rp\s?|(,*)/g, '') as any}
          />
        </Form.Item>

        <Form.Item
          name="stock"
          label="Stock"
          rules={[{ required: true, message: 'Please enter stock quantity' }]}
        >
          <InputNumber style={{ width: '100%' }} min={0} precision={0} />
        </Form.Item>

        <Form.Item
          name="stockAlertThreshold"
          label="Stock Alert Threshold"
          tooltip="When stock drops below this number, the system will highlight it as low stock."
          initialValue={10}
        >
          <InputNumber style={{ width: '100%' }} min={0} precision={0} />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <Input.TextArea placeholder="Enter product description" rows={3} />
        </Form.Item>
      </Form>
    </Modal>
  );
};
