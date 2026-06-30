import React from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Space, Typography } from 'antd';
import {
  DashboardOutlined,
  ShoppingOutlined,
  TagsOutlined,
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  ShoppingCartOutlined
} from '@ant-design/icons';
import { useAuthStore } from '../../stores/auth.store';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

const { Header, Sider, Content } = Layout;
const { Text, Title } = Typography;

export const BackofficeLayout: React.FC = () => {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = React.useState(false);

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const menuItems = [
    {
      key: '/backoffice',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    ...(user?.role === 'ADMIN'
      ? [
          {
            key: '/backoffice/products',
            icon: <ShoppingOutlined />,
            label: 'Products',
          },
          {
            key: '/backoffice/categories',
            icon: <TagsOutlined />,
            label: 'Categories',
          },
        ]
      : []),
    {
      key: '/backoffice/sales',
      icon: <ShoppingCartOutlined />,
      label: 'Kasir / Sales',
    },
    {
      key: '/backoffice/settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
  ];

  const handleMenuClick = (e: any) => {
    navigate(e.key);
  };

  const userMenu = {
    items: [
      {
        key: 'profile',
        label: 'My Profile',
        icon: <UserOutlined />,
      },
      {
        type: 'divider' as const,
      },
      {
        key: 'logout',
        label: 'Logout',
        icon: <LogoutOutlined />,
        onClick: handleLogout,
      },
    ],
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme="dark"
        style={{
          background: '#0f172a',
          boxShadow: '2px 0 8px 0 rgba(29, 35, 41, 0.05)',
        }}
      >
        <div style={{ height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: '#1e293b' }}>
          <Title level={4} style={{ color: '#ffffff', margin: 0, fontWeight: 700, letterSpacing: '-0.03em' }}>
            {collapsed ? 'POS' : 'POS UMKM'}
          </Title>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ background: 'transparent', padding: '16px 0' }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #f1f5f9',
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />

          <Space size="middle">
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Text strong style={{ display: 'block', fontSize: '0.9rem', color: '#1e293b' }}>
                {user?.fullName}
              </Text>
              <Text type="secondary" style={{ fontSize: '0.75rem', textTransform: 'capitalize' }}>
                {user?.role.toLowerCase()}
              </Text>
            </div>
            <Dropdown menu={userMenu} placement="bottomRight" trigger={['click']}>
              <Avatar style={{ backgroundColor: '#6366f1', cursor: 'pointer' }} icon={<UserOutlined />} />
            </Dropdown>
          </Space>
        </Header>
        <Content
          style={{
            margin: '24px',
            padding: '24px',
            background: '#ffffff',
            borderRadius: '12px',
            minHeight: 280,
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};
