import React, { useState } from "react";
import {
  Table,
  Button,
  Input,
  Select,
  Space,
  Typography,
  Card,
  Modal,
  Popover,
  Badge,
} from "antd";
import { PlusOutlined, SearchOutlined, FilterOutlined } from "@ant-design/icons";
import { useProductsPresenter } from "./products.presenter";
import { useProductColumns } from "./products-list.columns";
import type { ProductItem } from "./products.types";
import { ProductFormModal } from "./products-form.view";
import { ConfirmModal } from "../../components/common/confirm-modal.component";
import { formatCurrency } from "../../libs/format.lib";
import { createServerPagination } from "../../libs/pagination.lib";

const { Title, Paragraph } = Typography;

export const ProductListView: React.FC = () => {
  const presenter = useProductsPresenter();

  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(
    null,
  );
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState<ProductItem | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productIdToDelete, setProductIdToDelete] = useState<string | null>(
    null,
  );
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDeleteClick = (id: string) => {
    setProductIdToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productIdToDelete) return;
    setDeleteLoading(true);
    try {
      await presenter.deleteProduct(productIdToDelete);
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
    presenter.fetchProducts();
  };

  const columns = useProductColumns({
    onDetail: handleOpenDetail,
    onEdit: handleOpenEdit,
    onDelete: handleDeleteClick,
  });

  const activeFiltersCount = presenter.query.categoryId ? 1 : 0;

  const filterContent = (
    <div style={{ padding: "8px 4px", width: 240 }}>
      <div style={{ marginBottom: 16 }}>
        <Typography.Text strong style={{ display: "block", marginBottom: 6 }}>
          Kategori
        </Typography.Text>
        <Select
          placeholder="Pilih Kategori"
          allowClear
          style={{ width: "100%" }}
          onChange={presenter.handleCategoryFilter}
          value={presenter.query.categoryId}
        >
          {presenter.categories.map((cat) => (
            <Select.Option key={cat.id} value={cat.id}>
              {cat.name}
            </Select.Option>
          ))}
        </Select>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          borderTop: "1px solid #E7E5E4",
          paddingTop: 8,
        }}
      >
        <Button
          type="text"
          size="small"
          onClick={() => presenter.handleCategoryFilter(undefined)}
          disabled={activeFiltersCount === 0}
          style={{ color: activeFiltersCount > 0 ? "#C2410C" : undefined }}
        >
          Reset Filter
        </Button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <Title level={2} className="page-title">
            Produk
          </Title>
          <Paragraph className="page-subtitle">
            Kelola, cari, dan perbarui seluruh informasi produk UMKM Anda.
          </Paragraph>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleOpenAdd}
          className="btn-primary-terracotta"
        >
          Tambah Produk
        </Button>
      </div>

      <Card styles={{ body: { padding: 24 } }}>
        <div className="search-bar">
          <Space
            wrap
            style={{ width: "100%", justifyContent: "space-between" }}
          >
            <Input.Search
              placeholder="Cari berdasarkan kode atau nama..."
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={presenter.handleSearch}
              className="input-search"
              style={{ width: 320 }}
            />

            <Popover
              content={filterContent}
              title={<strong style={{ fontSize: 16 }}>Filter Produk</strong>}
              trigger="click"
              placement="bottomRight"
            >
              <Badge count={activeFiltersCount} size="small" offset={[0, 0]} color="#C2410C">
                <Button icon={<FilterOutlined />} className="btn-secondary-default" style={{ height: "40px" }}>
                  Filter
                </Button>
              </Badge>
            </Popover>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={presenter.products}
          rowKey="id"
          loading={presenter.loading}
          pagination={createServerPagination({
            current: presenter.query.page,
            pageSize: presenter.query.limit,
            total: presenter.total,
            onChange: presenter.handlePageChange,
          })}
        />
      </Card>

      <ProductFormModal
        open={formOpen}
        onCancel={() => setFormOpen(false)}
        onSuccess={handleFormSuccess}
        editingProduct={editingProduct}
        categories={presenter.categories}
      />

      <Modal
        title={<span className="modal-title">Detail Produk</span>}
        open={detailOpen}
        onCancel={() => {
          setDetailOpen(false);
          setDetailProduct(null);
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setDetailOpen(false);
              setDetailProduct(null);
            }}
          >
            Tutup
          </Button>,
        ]}
        width={600}
      >
        {detailProduct && (
          <div
            className="modal-detail-content"
            style={{ display: "flex", gap: 24 }}
          >
            <div style={{ flex: 1 }}>
              <div className="detail-field">
                <span className="detail-label">Kode</span>
                <span className="detail-value-mono">{detailProduct.sku}</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">Nama Produk</span>
                <span className="text-semibold" style={{ fontSize: 16 }}>
                  {detailProduct.name}
                </span>
              </div>
              <div className="detail-field">
                <span className="detail-label">Kategori</span>
                <span
                  className="badge-category"
                  style={{ display: "inline-block", marginTop: 4 }}
                >
                  {detailProduct.category?.name || "N/A"}
                </span>
              </div>
              <div className="detail-field">
                <span className="detail-label">Harga Jual</span>
                <span
                  className="text-lg text-primary-color"
                  style={{ fontWeight: 700 }}
                >
                  {formatCurrency(detailProduct.price)}
                </span>
              </div>
              <div className="detail-field">
                <span className="detail-label">Stok Tersedia</span>
                <span
                  className="text-semibold"
                  style={{
                    fontSize: 15,
                    color:
                      detailProduct.stock <= detailProduct.stockAlertThreshold
                        ? "#DC2626"
                        : "#1C1917",
                  }}
                >
                  {detailProduct.stock} unit{" "}
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: "normal",
                      color: "#57534E",
                    }}
                  >
                    (Batas minimum stok rendah:{" "}
                    {detailProduct.stockAlertThreshold})
                  </span>
                </span>
              </div>
              <div className="detail-field">
                <span className="detail-label">Deskripsi</span>
                <span
                  className="body-small"
                  style={{ display: "block", marginTop: 4 }}
                >
                  {detailProduct.description || "-"}
                </span>
              </div>
            </div>
            {detailProduct.imageUrl && (
              <div
                style={{
                  width: 220,
                  height: 220,
                  border: "var(--border-subtle)",
                  borderRadius: 8,
                  overflow: "hidden",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "var(--color-background)",
                }}
              >
                <img
                  src={detailProduct.imageUrl}
                  alt={detailProduct.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
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
