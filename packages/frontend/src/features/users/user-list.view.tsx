import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Popconfirm, message, Typography, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, KeyOutlined } from '@ant-design/icons';
import { UsersPresenter } from './users.presenter';
import { UserFormView } from './user-form.view';
import { PasswordChangeModalView } from './password-change-modal.view';

const { Title, Paragraph } = Typography;

export const UserListView: React.FC = () => {
  const presenter = new UsersPresenter();

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal states
  const [formVisible, setFormVisible] = useState<boolean>(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [pwVisible, setPwVisible] = useState<boolean>(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await presenter.getAllUsers();
      setUsers(data);
    } catch (err: any) {
      message.error(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAdd = () => {
    setSelectedUserId(null);
    setFormVisible(true);
  };

  const handleEdit = (id: string) => {
    setSelectedUserId(id);
    setFormVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await presenter.deleteUser(id);
      message.success('User deleted successfully');
      fetchUsers();
    } catch (err: any) {
      message.error(err.message || 'Failed to delete user');
    }
  };

  const columns = [
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      render: (text: string) => <strong style={{ color: '#1C1917' }}>{text}</strong>,
    },
    {
      title: 'Full Name',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        if (role === 'ADMIN') {
          return <Tag color="#C2410C">ADMIN</Tag>;
        }
        return <Tag color="#365314">CASHIER</Tag>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <span
          style={{
            display: 'inline-block',
            padding: '2px 8px',
            fontSize: '12px',
            fontWeight: 600,
            borderRadius: '4px',
            backgroundColor: isActive ? '#DCFCE7' : '#FEE2E2',
            color: isActive ? '#166534' : '#991B1B',
            border: `1px solid ${isActive ? '#BBF7D0' : '#FCA5A5'}`,
          }}
        >
          {isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (dateStr: string) => new Date(dateStr).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined style={{ color: '#C2410C' }} />}
            onClick={() => handleEdit(record.id)}
            style={{ padding: 0 }}
          />
          <Popconfirm
            title="Are you sure you want to delete this user?"
            description="This action cannot be undone."
            onConfirm={() => handleDelete(record.id)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true, style: { borderRadius: '4px' } }}
            cancelButtonProps={{ style: { borderRadius: '4px' } }}
          >
            <Button
              type="text"
              icon={<DeleteOutlined style={{ color: '#DC2626' }} />}
              style={{ padding: 0 }}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <Title level={2} style={{ fontFamily: "'Playfair Display', serif", color: '#C2410C', margin: 0 }}>
            User Management
          </Title>
          <Paragraph style={{ fontFamily: "'Inter', sans-serif", color: '#57534E', marginTop: '4px', marginBottom: 0 }}>
            Manage backoffice user accounts for administrators and cashiers.
          </Paragraph>
        </div>
        <Space>
          <Button
            type="default"
            icon={<KeyOutlined />}
            onClick={() => setPwVisible(true)}
            style={{
              border: '1.5px solid #C2410C',
              color: '#C2410C',
              height: '42px',
              borderRadius: '4px',
            }}
          >
            Change My Password
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            style={{
              backgroundColor: '#C2410C',
              borderColor: '#C2410C',
              height: '42px',
              borderRadius: '4px',
            }}
          >
            Add User
          </Button>
        </Space>
      </div>

      <Card
        style={{
          border: '1px solid #E7E5E4',
          borderRadius: '8px',
          backgroundColor: '#FFFFFF',
        }}
        bodyStyle={{ padding: '0px' }}
      >
        <Table
          dataSource={users}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          style={{ fontFamily: "'Inter', sans-serif" }}
        />
      </Card>

      <UserFormView
        visible={formVisible}
        userId={selectedUserId}
        onCancel={() => setFormVisible(false)}
        onSuccess={() => {
          setFormVisible(false);
          fetchUsers();
        }}
      />

      <PasswordChangeModalView
        visible={pwVisible}
        onCancel={() => setPwVisible(false)}
        onSuccess={() => setPwVisible(false)}
      />
    </div>
  );
};
export default UserListView;
