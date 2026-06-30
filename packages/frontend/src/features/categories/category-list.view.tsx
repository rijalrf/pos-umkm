import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, Card, Typography, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { CategoriesService, CategoryPayload } from './categories.service';

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
        message.success('Category deleted successfully');
        fetchCategories();
      } else {
        message.error(response.message || 'Failed to delete category');
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Error deleting category');
    }
  };

  const handleFormSubmit = async (values: CategoryPayload) => {
    setSubmitLoading(true);
    try {
      if (editingId) {
        const response = await CategoriesService.update(editingId, values);
        if (response.success) {
          message.success('Category updated successfully');
          setIsModalOpen(false);
          fetchCategories();
        } else {
          message.error(response.message || 'Failed to update category');
        }
      } else {
        const response = await CategoriesService.create(values);
        if (response.success) {
          message.success('Category created successfully');
          setIsModalOpen(false);
          fetchCategories();
        } else {
          message.error(response.message || 'Failed to create category');
        }
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Error processing request');
    } finally {
      setSubmitLoading(false);
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <span style={{ fontWeight: 600 }}>{text}</span>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text: string | null) => text || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No description</span>,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_: any, record: CategoryItem) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined style={{ color: '#1677ff' }} />}
            onClick={() => handleOpenEditModal(record)}
          />
          <Popconfirm
            title="Delete Category"
            description="Are you sure you want to delete this category? All associated products will be deleted as well."
            onConfirm={() => handleDelete(record.id)}
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
          <Title level={2} style={{ margin: 0 }}>Categories</Title>
          <Paragraph type="secondary" style={{ margin: 0 }}>
            Manage category tags for product classification.
          </Paragraph>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleOpenAddModal}
          style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
            border: 'none',
            height: '40px',
            borderRadius: '6px',
            boxShadow: '0 4px 10px rgba(99, 102, 241, 0.2)',
          }}
        >
          Add Category
        </Button>
      </div>

      <Card bordered={false} style={{ boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <Table
          columns={columns}
          dataSource={categories}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingId ? 'Edit Category' : 'Create Category'}
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
            label="Category Name"
            rules={[{ required: true, message: 'Please input the category name!' }]}
          >
            <Input placeholder="e.g. Makanan, Minuman, Snacking" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea placeholder="Describe this category" rows={4} />
          </Form.Item>

          <Form.Item style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={submitLoading}>
                {editingId ? 'Save Changes' : 'Create'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
