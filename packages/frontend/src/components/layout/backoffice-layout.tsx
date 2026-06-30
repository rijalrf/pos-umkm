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
  ShoppingCartOutlined,
  LineChartOutlined
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
          {
            key: '/backoffice/users',
            icon: <UserOutlined />,
            label: 'Users',
          },
          {
            key: '/backoffice/reports',
            icon: <LineChartOutlined />,
            label: 'Laporan Penjualan',
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
    <Layout style={{ minHeight: '100vh', background: '#FFFBF5' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          background: '#FFFBF5',
          borderRight: '1px solid #E7E5E4',
        }}
      >
        <div style={{
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          background: '#FFFBF5',
          borderBottom: '1px solid #E7E5E4',
        }}>
          <Title level={4} style={{
            color: '#C2410C',
            margin: 0,
            fontFamily: "'Playfair Display', serif",
            fontWeight: 700,
            letterSpacing: '-0.01em',
          }}>
            {collapsed ? 'MN' : 'MarketNest'}
          </Title>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ background: 'transparent', padding: '16px 0', borderRight: 0 }}
        />
      </Sider>
      <Layout style={{ background: '#FFFBF5' }}>
        <Header
          style={{
            padding: '0 24px',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #E7E5E4',
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64, color: '#C2410C' }}
          />

          <Space size="middle">
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Text strong style={{ display: 'block', fontSize: '0.9rem', color: '#1C1917' }}>
                {user?.fullName}
              </Text>
              <Text type="secondary" style={{ fontSize: '0.75rem', textTransform: 'capitalize', color: '#57534E' }}>
                {user?.role.toLowerCase()}
              </Text>
            </div>
            <Dropdown menu={userMenu} placement="bottomRight" trigger={['click']}>
              <Avatar style={{ backgroundColor: '#C2410C', cursor: 'pointer' }} icon={<UserOutlined />} />
            </Dropdown>
          </Space>
        </Header>
        <Content
          style={{
            margin: '24px',
            padding: '24px',
            background: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #E7E5E4',
            minHeight: 280,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>

  );
};
