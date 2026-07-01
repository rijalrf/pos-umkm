import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Space, Typography, Drawer, Grid } from 'antd';
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
  LineChartOutlined,
  HistoryOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { useAuthStore } from '../../stores/auth.store';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Breadcrumbs } from '../common/breadcrumb.component';
import { api } from '../../libs/api.lib';

const { Header, Sider, Content } = Layout;
const { Text, Title } = Typography;
const { useBreakpoint } = Grid;

export const BackofficeLayout: React.FC = () => {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(true);
  const [storeName, setStoreName] = useState<string>('POS UMKM');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const screens = useBreakpoint();

  const isMobile = screens.md === false; // undefined on first render, check explicitly for false

  useEffect(() => {
    // Open sidebar by default on desktop, close on mobile
    if (window.innerWidth >= 768) {
      setCollapsed(false);
    }
  }, []);

  useEffect(() => {
    async function loadStoreSettings() {
      try {
        const response = await api.get('/settings/store');
        if (response.data && response.data.success) {
          setStoreName(response.data.data.storeName || 'POS UMKM');
          setLogoUrl(response.data.data.logoUrl || null);
        }
      } catch (error) {
        console.error('Failed to load store settings in layout:', error);
      }
    }
    loadStoreSettings();
  }, []);

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const getMenuItems = (isCollapsed: boolean) => {
    if (isCollapsed) {
      return [
        {
          key: '/backoffice',
          icon: <DashboardOutlined />,
          label: 'Dashboard',
        },
        {
          key: '/backoffice/sales',
          icon: <ShoppingCartOutlined />,
          label: 'Kasir',
        },
        {
          key: '/backoffice/transactions',
          icon: <HistoryOutlined />,
          label: 'Penjualan',
        },
        {
          key: '/backoffice/customers',
          icon: <TeamOutlined />,
          label: 'Pelanggan',
        },
        ...(user?.role === 'ADMIN'
          ? [
              {
                key: '/backoffice/reports',
                icon: <LineChartOutlined />,
                label: 'Laporan',
              },
              {
                key: '/backoffice/products',
                icon: <ShoppingOutlined />,
                label: 'Produk',
              },
              {
                key: '/backoffice/categories',
                icon: <TagsOutlined />,
                label: 'Kategori',
              },
              {
                key: '/backoffice/users',
                icon: <UserOutlined />,
                label: 'Pengguna',
              },
            ]
          : []),
        {
          key: '/backoffice/settings',
          icon: <SettingOutlined />,
          label: 'Pengaturan',
        },
      ];
    }

    return [
      {
        key: '/backoffice',
        icon: <DashboardOutlined />,
        label: 'Dashboard',
      },
      {
        type: 'group' as const,
        label: 'Transaksi',
        children: [
          {
            key: '/backoffice/sales',
            icon: <ShoppingCartOutlined />,
            label: 'Kasir',
          },
          {
            key: '/backoffice/transactions',
            icon: <HistoryOutlined />,
            label: 'Penjualan',
          },
          {
            key: '/backoffice/customers',
            icon: <TeamOutlined />,
            label: 'Pelanggan',
          },
        ],
      },
      ...(user?.role === 'ADMIN'
        ? [
            {
              type: 'group' as const,
              label: 'Master',
              children: [
                {
                  key: '/backoffice/products',
                  icon: <ShoppingOutlined />,
                  label: 'Produk',
                },
                {
                  key: '/backoffice/categories',
                  icon: <TagsOutlined />,
                  label: 'Kategori',
                },
              ],
            },
            {
              type: 'group' as const,
              label: 'Manajemen',
              children: [
                {
                  key: '/backoffice/reports',
                  icon: <LineChartOutlined />,
                  label: 'Laporan',
                },
                {
                  key: '/backoffice/users',
                  icon: <UserOutlined />,
                  label: 'Pengguna',
                },
              ],
            },
          ]
        : []),
      {
        type: 'group' as const,
        label: 'Pengaturan',
        children: [
          {
            key: '/backoffice/settings',
            icon: <SettingOutlined />,
            label: 'Pengaturan',
          },
        ],
      },
    ];
  };

  const handleMenuClick = (e: any) => {
    navigate(e.key);
  };

  const renderSidebarLogo = () => {
    if (logoUrl) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          <img 
            src={logoUrl} 
            alt="Logo Toko" 
            style={{ 
              height: '40px', 
              width: '40px', 
              objectFit: 'contain', 
              borderRadius: '4px',
              border: '1px solid #E7E5E4' 
            }} 
          />
        </div>
      );
    }

    return (
      <Title level={4} style={{
        color: '#C2410C',
        margin: 0,
        fontFamily: "'Inter', sans-serif",
        fontWeight: 700,
        letterSpacing: '-0.01em',
      }}>
        POS
      </Title>
    );
  };

  const userMenu = {
    items: [
      {
        key: 'profile',
        label: 'Profil Saya',
        icon: <UserOutlined />,
      },
      {
        type: 'divider' as const,
      },
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
      {!isMobile && (
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
            {renderSidebarLogo()}
          </div>
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={getMenuItems(collapsed)}
            onClick={handleMenuClick}
            style={{ background: 'transparent', padding: '16px 0', borderRight: 0 }}
          />
        </Sider>
      )}

      {isMobile && (
        <Drawer
          title={renderSidebarLogo()}
          placement="left"
          closable={true}
          onClose={() => setCollapsed(true)}
          open={!collapsed}
          styles={{
            body: { padding: 0, background: '#FFFBF5' },
            header: { background: '#FFFBF5', borderBottom: '1px solid #E7E5E4' }
          }}
          width={240}
        >
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={getMenuItems(false)}
            onClick={(e) => {
              handleMenuClick(e);
              setCollapsed(true);
            }}
            style={{ background: 'transparent', padding: '16px 0', borderRight: 0 }}
          />
        </Drawer>
      )}

      <Layout style={{ background: '#FFFBF5' }}>
        <Header
          style={{
            padding: isMobile ? '0 16px' : '0 24px',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #E7E5E4',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: '16px', width: 64, height: 64, color: '#C2410C', padding: 0 }}
            />
            <span style={{ 
              fontSize: isMobile ? '16px' : '18px', 
              fontWeight: 700, 
              color: '#1C1917',
              fontFamily: "'Inter', sans-serif",
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: isMobile ? '150px' : '300px'
            }}>
              {storeName}
            </span>
          </div>

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
            margin: isMobile ? '12px' : '24px',
            padding: 0,
            background: 'transparent',
            minHeight: 280,
          }}
        >
          <Breadcrumbs />
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};
