import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, message, Typography, Card, Dropdown } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, KeyOutlined, MoreOutlined } from '@ant-design/icons';
import { UsersPresenter } from './users.presenter';
import { UserFormView } from './user-form.view';
import { PasswordChangeModalView } from './password-change-modal.view';
import { ConfirmModal } from '../../components/common/confirm-modal.component';

const { Title, Paragraph } = Typography;

export const UserListView: React.FC = () => {
  const presenter = new UsersPresenter();

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal states
  const [formVisible, setFormVisible] = useState<boolean>(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [pwVisible, setPwVisible] = useState<boolean>(false);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDeleteClick = (id: string) => {
    setUserIdToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userIdToDelete) return;
    setDeleteLoading(true);
    try {
      await handleDelete(userIdToDelete);
    } finally {
      setDeleteLoading(false);
      setDeleteConfirmOpen(false);
      setUserIdToDelete(null);
    }
  };

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
      title: 'Nama Lengkap',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'Peran',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        if (role === 'ADMIN') {
          return <Tag color="#C2410C">ADMIN</Tag>;
        }
        return <Tag color="#365314">KASIR</Tag>;
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
          {isActive ? 'Aktif' : 'Tidak Aktif'}
        </span>
      ),
    },
    {
      title: 'Tanggal Dibuat',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (dateStr: string) => new Date(dateStr).toLocaleDateString(),
    },
    {
      title: 'Aksi',
      key: 'actions',
      width: 100,
      align: 'center' as const,
      render: (_: any, record: any) => {
        const actionMenu = {
          items: [
            {
              key: 'edit',
              label: 'Edit',
              icon: <EditOutlined style={{ color: '#C2410C' }} />,
              onClick: () => handleEdit(record.id)
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
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <Title level={2} style={{ fontFamily: "'Inter', sans-serif", color: '#C2410C', margin: 0 }}>
            Pengguna
          </Title>
          <Paragraph style={{ fontFamily: "'Inter', sans-serif", color: '#57534E', marginTop: '4px', marginBottom: 0 }}>
            Kelola akun pengguna backoffice untuk administrator dan staf kasir.
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
            Ubah Password Saya
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
            Tambah Pengguna
          </Button>
        </Space>
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
      <ConfirmModal
        open={deleteConfirmOpen}
        title="Hapus Pengguna"
        description="Apakah Anda yakin ingin menghapus pengguna ini? Tindakan ini tidak dapat dibatalkan."
        confirmLoading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </div>
  );
};
export default UserListView;
