import React from 'react';
import { Table, Button, Space, Form, Input, Typography, Card, Dropdown } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, MoreOutlined } from '@ant-design/icons';
import { useCategoriesPresenter } from './categories.presenter';
import { ConfirmModal } from '../../components/common/confirm-modal.component';
import { FormModal } from '../../components/common/form-modal.component';
import { CategoryItem } from './categories.types';

const { Title, Paragraph, Text } = Typography;

export const CategoryListView: React.FC = () => {
  const presenter = useCategoriesPresenter();

  const columns = [
    {
      title: 'Nama Kategori',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text className="text-semibold">{text}</Text>,
    },
    {
      title: 'Deskripsi',
      dataIndex: 'description',
      key: 'description',
      render: (text: string | null) => text || <Text className="text-secondary-muted">Tidak ada deskripsi</Text>,
    },
    {
      title: 'Aksi',
      key: 'actions',
      width: 100,
      align: 'center' as const,
      render: (_: any, record: CategoryItem) => {
        const actionMenu = {
          items: [
            {
              key: 'edit',
              label: 'Edit',
              icon: <EditOutlined className="text-primary-color" />,
              onClick: () => presenter.handleOpenEditModal(record)
            },
            {
              type: 'divider' as const,
            },
            {
              key: 'delete',
              label: 'Hapus',
              icon: <DeleteOutlined />,
              danger: true,
              onClick: () => presenter.handleDeleteClick(record.id)
            }
          ]
        };

        return (
          <Dropdown menu={actionMenu} trigger={['click']} placement="bottomRight">
            <Button
              type="text"
              icon={<MoreOutlined className="text-action-more" />}
              className="p-0"
            />
          </Dropdown>
        );
      }
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <Title level={2} className="page-title">Kategori</Title>
          <Paragraph className="page-subtitle">
            Kelola kategori produk untuk memudahkan pengelompokkan persediaan barang UMKM Anda.
          </Paragraph>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={presenter.handleOpenAddModal}
          className="btn-primary-terracotta"
        >
          Tambah Kategori
        </Button>
      </div>

      <Card bodyStyle={{ padding: '24px' }}>
        <Table
          columns={columns}
          dataSource={presenter.categories}
          rowKey="id"
          loading={presenter.loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <FormModal
        title={presenter.editingId ? 'Ubah Kategori' : 'Tambah Kategori'}
        open={presenter.isModalOpen}
        onCancel={presenter.handleCancelModal}
        hideFooter
      >
        <Form
          form={presenter.form}
          layout="vertical"
          onFinish={presenter.handleFormSubmit}
          className="form-container"
        >
          <Form.Item
            name="name"
            label={<span className="form-label-bold">Nama Kategori</span>}
            rules={[{ required: true, message: 'Nama kategori wajib diisi!' }]}
          >
            <Input placeholder="Contoh: Makanan, Minuman, Pakaian" />
          </Form.Item>

          <Form.Item
            name="description"
            label={<span className="form-label-bold">Deskripsi</span>}
          >
            <Input.TextArea placeholder="Tulis deskripsi kategori" rows={4} />
          </Form.Item>

          <Form.Item className="flex-end-container">
            <Space>
              <Button onClick={presenter.handleCancelModal} className="btn-cancel">Batal</Button>
              <Button type="primary" htmlType="submit" loading={presenter.submitLoading} className="btn-primary-terracotta">
                {presenter.editingId ? 'Simpan Perubahan' : 'Buat Baru'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </FormModal>

      <ConfirmModal
        open={presenter.deleteConfirmOpen}
        title="Hapus Kategori"
        description="Apakah Anda yakin ingin menghapus kategori ini? Semua produk yang berkaitan dengan kategori ini juga akan terhapus secara permanen."
        confirmLoading={presenter.deleteLoading}
        onConfirm={presenter.handleDeleteConfirm}
        onCancel={presenter.handleCancelDelete}
      />
    </div>
  );
};
