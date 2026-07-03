import React, { useState } from 'react';
import { Table, Button, Input, Select, Space, Typography, Card, Modal, Dropdown } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, WarningOutlined, EyeOutlined, MoreOutlined } from '@ant-design/icons';
import { useProductsPresenter } from './products.presenter';
import { ProductItem } from './products.types';
import { ProductFormModal } from './products-form.view';
import { ConfirmModal } from '../../components/common/confirm-modal.component';

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
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState<ProductItem | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productIdToDelete, setProductIdToDelete] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDeleteClick = (id: string) => {
    setProductIdToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productIdToDelete) return;
    setDeleteLoading(true);
    try {
      await deleteProduct(productIdToDelete);
    } finally {
      setDeleteLoading(false);
      setDeleteConfirmOpen(false);
      setProductIdToDelete(null);
    }
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (product: ProductItem) => {
    setEditingProduct(product);
    setFormOpen(true);
  };

  const handleOpenDetail = (product: ProductItem) => {
    setDetailProduct(product);
    setDetailOpen(true);
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
      title: 'Kode',
      dataIndex: 'sku',
      key: 'sku',
      render: (sku: string) => <span style={{ color: '#57534E' }}>{sku}</span>,
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
      render: (catName: string) => <span>{catName || '-'}</span>,
    },
    {
      title: 'Harga',
      dataIndex: 'price',
      key: 'price',
      render: (price: string) => <span>{formatCurrency(price)}</span>,
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
              fontWeight: isLowStock ? 700 : 'normal'
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
      width: 100,
      align: 'center' as const,
      render: (_: any, record: ProductItem) => {
        const actionMenu = {
          items: [
            {
              key: 'detail',
              label: 'Detail',
              icon: <EyeOutlined style={{ color: '#3B82F6' }} />,
              onClick: () => handleOpenDetail(record)
            },
            {
              key: 'edit',
              label: 'Edit',
              icon: <EditOutlined style={{ color: '#C2410C' }} />,
              onClick: () => handleOpenEdit(record)
            },
            {
              type: 'divider' as const,
            },
            {
              key: 'delete',
              label: 'Hapus',
              icon: <DeleteOutlined />,
              danger: true,
              onClick: () => handleDeleteClick(record.id)
            }
          ]
        };

        return (
          <Dropdown menu={actionMenu} trigger={['click']} placement="bottomRight">
            <Button
              type="text"
              icon={<MoreOutlined style={{ fontSize: '18px', color: '#57534E' }} />}
              style={{ padding: 0 }}
            />
          </Dropdown>
        );
      }
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
              placeholder="Cari berdasarkan kode atau nama..."
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

      <Modal
        title={<span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, color: '#C2410C' }}>Detail Produk</span>}
        open={detailOpen}
        onCancel={() => {
          setDetailOpen(false);
          setDetailProduct(null);
        }}
        footer={[
          <Button key="close" onClick={() => {
            setDetailOpen(false);
            setDetailProduct(null);
          }}>
            Tutup
          </Button>
        ]}
        width={600}
      >
        {detailProduct && (
          <div style={{ marginTop: '20px', display: 'flex', gap: '24px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', color: '#878685', display: 'block', fontWeight: 600 }}>Kode</span>
                <span style={{ fontWeight: 600, fontSize: '15px', color: '#1C1917' }}>{detailProduct.sku}</span>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', color: '#878685', display: 'block', fontWeight: 600 }}>Nama Produk</span>
                <span style={{ fontSize: '16px', fontWeight: 600, color: '#1C1917' }}>{detailProduct.name}</span>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', color: '#878685', display: 'block', fontWeight: 600 }}>Kategori</span>
                <span style={{
                  background: '#F0FDF4',
                  color: '#365314',
                  border: '1px solid #DCFCE7',
                  borderRadius: '4px',
                  padding: '2px 8px',
                  fontSize: '12px',
                  fontWeight: 600,
                  fontFamily: "'Inter', sans-serif",
                  display: 'inline-block',
                  marginTop: '4px'
                }}>
                  {detailProduct.category?.name || 'N/A'}
                </span>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', color: '#878685', display: 'block', fontWeight: 600 }}>Harga Jual</span>
                <span style={{ fontSize: '18px', fontWeight: 700, color: '#C2410C' }}>{formatCurrency(detailProduct.price)}</span>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', color: '#878685', display: 'block', fontWeight: 600 }}>Stok Tersedia</span>
                <span style={{ fontSize: '15px', fontWeight: 600, color: detailProduct.stock <= detailProduct.stockAlertThreshold ? '#DC2626' : '#1C1917' }}>
                  {detailProduct.stock} unit <span style={{ fontSize: '13px', fontWeight: 'normal', color: '#57534E' }}>(Batas minimum stok rendah: {detailProduct.stockAlertThreshold})</span>
                </span>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', color: '#878685', display: 'block', fontWeight: 600 }}>Deskripsi</span>
                <span style={{ fontSize: '14px', color: '#57534E', display: 'block', marginTop: '4px' }}>{detailProduct.description || '-'}</span>
              </div>
            </div>
            {detailProduct.imageUrl && (
              <div style={{ width: '220px', height: '220px', border: '1px solid #E7E5E4', borderRadius: '8px', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFBF5' }}>
                <img src={detailProduct.imageUrl} alt={detailProduct.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmModal
        open={deleteConfirmOpen}
        title="Hapus Produk"
        description="Apakah Anda yakin ingin menghapus produk ini? Produk yang dihapus tidak dapat dipulihkan."
        confirmLoading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </div>
  );
};

