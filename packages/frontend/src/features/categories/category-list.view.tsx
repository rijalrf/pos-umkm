import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, Typography, message, Card, Dropdown } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, MoreOutlined } from '@ant-design/icons';
import { CategoriesService, CategoryPayload } from './categories.service';
import { ConfirmModal } from '../../components/common/confirm-modal.component';

const { Title, Paragraph } = Typography;

export interface CategoryItem {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
}

export const CategoryListView: React.FC = () => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [categoryIdToDelete, setCategoryIdToDelete] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDeleteClick = (id: string) => {
    setCategoryIdToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!categoryIdToDelete) return;
    setDeleteLoading(true);
    try {
      await handleDelete(categoryIdToDelete);
    } finally {
      setDeleteLoading(false);
      setDeleteConfirmOpen(false);
      setCategoryIdToDelete(null);
    }
  };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await CategoriesService.getAll();
      if (response.success) {
        setCategories(response.data);
      } else {
        message.error(response.message || 'Failed to fetch categories');
      }
    } catch (error) {
      message.error('Error fetching categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAddModal = () => {
    setEditingId(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (record: CategoryItem) => {
    setEditingId(record.id);
    form.setFieldsValue({
      name: record.name,
      description: record.description,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await CategoriesService.delete(id);
      if (response.success) {
        message.success('Kategori berhasil dihapus');
        fetchCategories();
      } else {
        message.error(response.message || 'Gagal menghapus kategori');
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Gagal menghapus kategori');
    }
  };

  const handleFormSubmit = async (values: CategoryPayload) => {
    setSubmitLoading(true);
    try {
      if (editingId) {
        const response = await CategoriesService.update(editingId, values);
        if (response.success) {
          message.success('Kategori berhasil diperbarui');
          setIsModalOpen(false);
          fetchCategories();
        } else {
          message.error(response.message || 'Gagal memperbarui kategori');
        }
      } else {
        const response = await CategoriesService.create(values);
        if (response.success) {
          message.success('Kategori berhasil dibuat');
          setIsModalOpen(false);
          fetchCategories();
        } else {
          message.error(response.message || 'Gagal membuat kategori');
        }
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Gagal memproses permintaan');
    } finally {
      setSubmitLoading(false);
    }
  };

  const columns = [
    {
      title: 'Nama Kategori',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <span style={{ fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>{text}</span>,
    },
    {
      title: 'Deskripsi',
      dataIndex: 'description',
      key: 'description',
      render: (text: string | null) => text || <span style={{ color: '#A8A29E', fontStyle: 'italic', fontFamily: "'Inter', sans-serif" }}>Tidak ada deskripsi</span>,
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
              icon: <EditOutlined style={{ color: '#C2410C' }} />,
              onClick: () => handleOpenEditModal(record)
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
          <Title level={2} style={{ margin: 0, fontFamily: "'Inter', sans-serif", color: '#C2410C' }}>Kategori</Title>
          <Paragraph style={{ margin: 0, fontFamily: "'Inter', sans-serif", color: '#57534E' }}>
            Kelola kategori produk untuk memudahkan pengelompokkan persediaan barang UMKM Anda.
          </Paragraph>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleOpenAddModal}
          style={{
            height: '42px',
            borderRadius: '4px',
            background: '#C2410C',
            border: 'none',
            fontFamily: "'Inter', sans-serif",
            fontWeight: 600,
          }}
        >
          Tambah Kategori
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
        <Table
          columns={columns}
          dataSource={categories}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={<span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, color: '#C2410C' }}>{editingId ? 'Ubah Kategori' : 'Tambah Kategori'}</span>}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
          style={{ marginTop: '16px' }}
        >
          <Form.Item
            name="name"
            label={<span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>Nama Kategori</span>}
            rules={[{ required: true, message: 'Nama kategori wajib diisi!' }]}
          >
            <Input placeholder="Contoh: Makanan, Minuman, Pakaian" />
          </Form.Item>

          <Form.Item
            name="description"
            label={<span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>Deskripsi</span>}
          >
            <Input.TextArea placeholder="Tulis deskripsi kategori" rows={4} />
          </Form.Item>

          <Form.Item style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>Batal</Button>
              <Button type="primary" htmlType="submit" loading={submitLoading} style={{ background: '#C2410C' }}>
                {editingId ? 'Simpan Perubahan' : 'Buat Baru'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <ConfirmModal
        open={deleteConfirmOpen}
        title="Hapus Kategori"
        description="Apakah Anda yakin ingin menghapus kategori ini? Semua produk yang berkaitan dengan kategori ini juga akan terhapus secara permanen."
        confirmLoading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </div>
  );
};

