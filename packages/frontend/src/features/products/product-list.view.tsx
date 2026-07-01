import React, { useState } from 'react';
import { Table, Button, Input, Select, Space, Typography, Popconfirm, Card } from 'antd';
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
      render: (sku: string) => (
        <span style={{
          fontFamily: "'Source Code Pro', monospace",
          fontSize: '13px',
          background: '#FFFBF5',
          border: '1.5px solid #D6D3D1',
          borderRadius: '4px',
          padding: '2px 8px',
          color: '#57534E',
        }}>
          {sku}
        </span>
      ),
    },
    {
      title: 'Nama Produk',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <span style={{ fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>{name}</span>,
    },
    {
      title: 'Kategori',
      dataIndex: ['category', 'name'],
      key: 'categoryName',
      render: (catName: string) => (
        <span style={{
          background: '#F0FDF4',
          color: '#365314',
          border: '1px solid #DCFCE7',
          borderRadius: '4px',
          padding: '2px 8px',
          fontSize: '12px',
          fontWeight: 600,
          fontFamily: "'Inter', sans-serif",
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          {catName || 'N/A'}
        </span>
      ),
    },
    {
      title: 'Harga',
      dataIndex: 'price',
      key: 'price',
      render: (price: string) => <span style={{ fontFamily: "'Source Code Pro', monospace" }}>{formatCurrency(price)}</span>,
    },
    {
      title: 'Stok',
      key: 'stock',
      render: (_: any, record: ProductItem) => {
        const isLowStock = record.stock <= record.stockAlertThreshold;
        return (
          <Space>
            <span style={{
              color: isLowStock ? '#DC2626' : 'inherit',
              fontWeight: isLowStock ? 700 : 'normal',
              fontFamily: "'Source Code Pro', monospace"
            }}>
              {record.stock}
            </span>
            {isLowStock && (
              <WarningOutlined style={{ color: '#F59E0B' }} title="Low stock warning!" />
            )}
          </Space>
        );
      },
    },
    {
      title: 'Aksi',
      key: 'actions',
      width: 150,
      render: (_: any, record: ProductItem) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined style={{ color: '#C2410C' }} />}
            onClick={() => handleOpenEdit(record)}
          />
          <Popconfirm
            title="Hapus Produk"
            description="Apakah Anda yakin ingin menghapus produk ini?"
            onConfirm={() => deleteProduct(record.id)}
            okText="Ya"
            cancelText="Tidak"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined style={{ color: '#DC2626' }} />}
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
          <Title level={2} style={{ margin: 0, fontFamily: "'Inter', sans-serif", color: '#C2410C' }}>Produk</Title>
          <Paragraph style={{ margin: 0, fontFamily: "'Inter', sans-serif", color: '#57534E' }}>
            Kelola, cari, dan perbarui seluruh informasi produk UMKM Anda.
          </Paragraph>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleOpenAdd}
          style={{
            height: '42px',
            borderRadius: '4px',
            background: '#C2410C',
            border: 'none',
            fontFamily: "'Inter', sans-serif",
            fontWeight: 600,
          }}
        >
          Tambah Produk
        </Button>
      </div>

      <Card
        style={{
          border: '1px solid #E7E5E4',
          borderRadius: '8px',
          backgroundColor: '#FFFFFF',
        }}
        bodyStyle={{ padding: '24px' }}
      >
        <div style={{ marginBottom: '24px' }}>
          <Space wrap style={{ width: '100%', justifyContent: 'space-between' }}>
            <Input.Search
              placeholder="Cari berdasarkan SKU atau nama..."
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={handleSearch}
              style={{ width: 300 }}
            />

            <Select
              placeholder="Filter Kategori"
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
        </div>

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

