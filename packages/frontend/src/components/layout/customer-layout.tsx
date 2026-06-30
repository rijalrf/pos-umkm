import React from 'react';
import { Layout, Menu, Button, Space, Typography, Dropdown, Avatar } from 'antd';
import { ShoppingOutlined, HistoryOutlined, UserOutlined, LogoutOutlined, LoginOutlined } from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useCustomerStore } from '../../stores/customer.store';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

export const CustomerLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { customer, isAuthenticated, logout } = useCustomerStore();

  const handleLogout = () => {
    logout();
    navigate('/customer/login');
  };

  const navItems = [
    {
      key: '/customer/catalog',
      icon: <ShoppingOutlined />,
      label: 'Katalog Produk',
    },
    ...(isAuthenticated
      ? [
          {
            key: '/customer/history',
            icon: <HistoryOutlined />,
            label: 'Riwayat Belanja',
          },
        ]
      : []),
  ];

  const handleMenuClick = (e: any) => {
    navigate(e.key);
  };

  const userMenu = {
    items: [
      {
        key: 'logout',
        label: 'Keluar',
        icon: <LogoutOutlined />,
        onClick: handleLogout,
      },
    ],
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#FFFBF5' }}>
      <Header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#ffffff',
          borderBottom: '1px solid #E7E5E4',
          padding: '0 24px',
          height: '64px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px', flex: 1 }}>
          <Title
            level={3}
            onClick={() => navigate('/customer/catalog')}
            style={{
              color: '#C2410C',
              margin: 0,
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            MarketNest
          </Title>
          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={navItems}
            onClick={handleMenuClick}
            style={{
              borderBottom: 0,
              background: 'transparent',
              flex: 1,
              minWidth: 0,
            }}
          />
        </div>

        <div>
          {isAuthenticated && customer ? (
            <Space size="middle">
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
                <Text strong style={{ fontSize: '0.85rem', color: '#1C1917' }}>
                  {customer.name}
                </Text>
                <Text type="secondary" style={{ fontSize: '0.75rem', color: '#365314', fontWeight: 600 }}>
                  Member
                </Text>
              </div>
              <Dropdown menu={userMenu} placement="bottomRight" trigger={['click']}>
                <Avatar style={{ backgroundColor: '#D4A373', cursor: 'pointer' }} icon={<UserOutlined />} />
              </Dropdown>
            </Space>
          ) : (
            <Space>
              <Button
                type="text"
                onClick={() => navigate('/customer/login')}
                icon={<LoginOutlined />}
                style={{ color: '#57534E', fontWeight: 600 }}
              >
                Masuk
              </Button>
              <Button
                type="primary"
                onClick={() => navigate('/customer/register')}
                style={{ backgroundColor: '#C2410C', borderColor: '#C2410C', fontWeight: 600 }}
              >
                Daftar Member
              </Button>
            </Space>
          )}
        </div>
      </Header>

      <Content style={{ padding: '24px 50px', background: '#FFFBF5' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', minHeight: 'calc(100vh - 188px)' }}>
          <Outlet />
        </div>
      </Content>

      <Footer
        style={{
          textAlign: 'center',
          background: '#ffffff',
          borderTop: '1px solid #E7E5E4',
          color: '#57534E',
          padding: '24px 50px',
        }}
      >
        <Title level={5} style={{ fontFamily: "'Playfair Display', serif", margin: '0 0 8px 0', color: '#C2410C' }}>
          MarketNest
        </Title>
        <Text style={{ fontSize: '14px', fontFamily: "'Inter', sans-serif" }}>
          Platform POS & Katalog Produk Kerajinan Tangan dan Karya Seni Lokal Nusantara.
        </Text>
        <div style={{ fontSize: '12px', color: '#A8A29E', marginTop: '8px' }}>
          &copy; 2026 MarketNest. Dibuat dengan cinta untuk UMKM Indonesia.
        </div>
      </Footer>
    </Layout>
  );
};
