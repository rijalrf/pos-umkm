import React from 'react';
import { Layout, Typography, Button, message } from 'antd';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useCustomerCartStore } from '../../stores/customer-cart.store';

const { Header, Content, Footer } = Layout;
const { Text } = Typography;

export const CustomerLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const cart = useCustomerCartStore();

  const cartCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const formatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  });

  const handleAddToCart = (product: any) => {
    try {
      cart.addItem(product);
      message.success(`${product.name} dimasukkan ke keranjang`);
    } catch (err: any) {
      message.error(err.message || 'Gagal menambahkan ke keranjang');
    }
  };

  const getPageTitle = () => {
    if (location.pathname.includes('/customer/product')) {
      return 'Detail Produk';
    }
    if (location.pathname.includes('/customer/checkout')) {
      return 'Keranjang & Checkout';
    }
    return 'Katalog Produk';
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#FFFBF5' }}>
      <Header className="customer-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Left: Spacer */}
        <div style={{ flex: 1 }} />

        {/* Center: Page Title */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <Text
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '18px',
              fontWeight: 700,
              color: '#1C1917',
              textAlign: 'center',
            }}
          >
            {getPageTitle()}
          </Text>
        </div>

        {/* Right: Spacer */}
        <div style={{ flex: 1 }} />
      </Header>

      <Content className="customer-content-wrapper">
        <div style={{ maxWidth: '1200px', margin: '0 auto', minHeight: 'calc(100vh - 180px)', paddingBottom: cartCount > 0 && location.pathname !== '/customer/checkout' ? '80px' : '24px' }}>
          {/* Inject handleAddToCart to subviews via Outlet Context */}
          <Outlet context={{ onAddToCart: handleAddToCart }} />
        </div>
      </Content>

      {/* Floating Bottom Cart Bar */}
      {cartCount > 0 && location.pathname !== '/customer/checkout' && (
        <div
          style={{
            position: 'fixed',
            bottom: '16px',
            left: '16px',
            right: '16px',
            maxWidth: '840px',
            margin: '0 auto',
            backgroundColor: '#C2410C',
            borderRadius: '8px',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 999,
            boxShadow: '0 8px 24px rgba(28, 25, 23, 0.15)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Text style={{ fontSize: '12px', color: '#FFFBF5', opacity: 0.9 }}>
              {cartCount} Produk di Keranjang
            </Text>
            <Text style={{ fontSize: '18px', fontWeight: 'bold', color: '#FFFFFF' }}>
              {formatter.format(cart.getTotalAmount())}
            </Text>
          </div>
          <Button
            type="default"
            onClick={() => navigate('/customer/checkout')}
            style={{
              backgroundColor: '#FFFFFF',
              color: '#C2410C',
              borderColor: '#FFFFFF',
              fontWeight: 'bold',
              borderRadius: '4px',
              height: '38px',
            }}
          >
            Checkout
          </Button>
        </div>
      )}

      <Footer
        style={{
          textAlign: 'center',
          background: '#ffffff',
          borderTop: '1px solid #E7E5E4',
          color: '#A8A29E',
          padding: '16px 0',
          fontSize: '12px',
          fontFamily: "'Inter', sans-serif",
        }}
      >
        &copy; 2026 POS UMKM. Dibuat dengan cinta untuk UMKM Indonesia.
      </Footer>
    </Layout>
  );
};

export default CustomerLayout;
