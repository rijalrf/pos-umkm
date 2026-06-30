import React, { useState } from 'react';
import { Table, Button, Input, Select, Space, Card, Typography, Tag, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, WarningOutlined } from '@ant-design/icons';
import { useProductsPresenter, ProductItem } from './products.presenter';
import { ProductFormModal } from './product-form.view';

const { Title, Paragraph } = Typography;

export const ProductListView: React.FC = () => {
  const {
    products,
    categories,
    loading,
    total,
    query,
    fetchProducts,
    handleSearch,
    handleCategoryFilter,
    handlePageChange,
    deleteProduct,
  } = useProductsPresenter();

  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (product: ProductItem) => {
    setEditingProduct(product);
    setFormOpen(true);
  };

  const handleFormSuccess = () => {
    setFormOpen(false);
    fetchProducts();
  };

  const formatCurrency = (amount: string | number) => {
    const value = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const columns = [
    {
      title: 'SKU / Barcode',
      dataIndex: 'sku',
      key: 'sku',
      render: (sku: string) => <Tag color="blue">{sku}</Tag>,
    },
    {
      title: 'Product Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <span style={{ fontWeight: 600 }}>{name}</span>,
    },
    {
      title: 'Category',
      dataIndex: ['category', 'name'],
      key: 'categoryName',
      render: (catName: string) => <Tag color="purple">{catName || 'N/A'}</Tag>,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price: string) => formatCurrency(price),
    },
    {
      title: 'Stock',
      key: 'stock',
      render: (_: any, record: ProductItem) => {
        const isLowStock = record.stock <= record.stockAlertThreshold;
        return (
          <Space>
            <span style={{ color: isLowStock ? '#ff4d4f' : 'inherit', fontWeight: isLowStock ? 700 : 'normal' }}>
              {record.stock}
            </span>
            {isLowStock && (
              <WarningOutlined style={{ color: '#faad14' }} title="Low stock warning!" />
            )}
          </Space>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_: any, record: ProductItem) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined style={{ color: '#1677ff' }} />}
            onClick={() => handleOpenEdit(record)}
          />
          <Popconfirm
            title="Delete Product"
            description="Are you sure you want to delete this product?"
            onConfirm={() => deleteProduct(record.id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>Products</Title>
          <Paragraph type="secondary" style={{ margin: 0 }}>
            Create, update, and manage product inventory listings.
          </Paragraph>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleOpenAdd}
          style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
            border: 'none',
            height: '40px',
            borderRadius: '6px',
            boxShadow: '0 4px 10px rgba(99, 102, 241, 0.2)',
          }}
        >
          Add Product
        </Button>
      </div>

      <Card bordered={false} style={{ boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '16px' }}>
        <Space wrap style={{ width: '100%', justifyContent: 'space-between' }}>
          <Input.Search
            placeholder="Search by SKU or name..."
            allowClear
            enterButton={<SearchOutlined />}
            onSearch={handleSearch}
            style={{ width: 300 }}
          />

          <Select
            placeholder="Filter by Category"
            allowClear
            style={{ width: 200 }}
            onChange={handleCategoryFilter}
            value={query.categoryId}
          >
            {categories.map((cat) => (
              <Select.Option key={cat.id} value={cat.id}>
                {cat.name}
              </Select.Option>
            ))}
          </Select>
        </Space>
      </Card>

      <Card bordered={false} style={{ boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <Table
          columns={columns}
          dataSource={products}
          rowKey="id"
          loading={loading}
          pagination={{
            current: query.page,
            pageSize: query.limit,
            total: total,
            onChange: handlePageChange,
            showSizeChanger: true,
          }}
        />
      </Card>

      <ProductFormModal
        open={formOpen}
        onCancel={() => setFormOpen(false)}
        onSuccess={handleFormSuccess}
        editingProduct={editingProduct}
        categories={categories}
      />
    </div>
  );
};
