import React, { useEffect } from 'react';
import { Card, Col, Row, Button, Spin, Typography } from 'antd';
import { ShoppingOutlined, MinusOutlined, PlusOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { useCustomerCatalogPresenter } from './customer-catalog.presenter';
import { useCustomerCartStore } from '../../stores/customer-cart.store';
import { formatCurrency } from '../../libs/format.lib';
import type { CustomerOutletContext } from './customer-catalog.types';

const { Title, Paragraph, Text } = Typography;

export const ProductDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const cart = useCustomerCartStore();
  const { onAddToCart } = useOutletContext<CustomerOutletContext>();
  const presenter = useCustomerCatalogPresenter();

  useEffect(() => {
    if (id) {
      presenter.fetchProductById(id);
    }
  }, [id, presenter.fetchProductById]);

  if (presenter.loading) {
    return (
      <div className="customer-flex-center" style={{ minHeight: '300px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!presenter.product) {
    return (
      <Card style={{ textAlign: 'center', padding: '40px' }}>
        <Title level={3} className="headline-text">Produk Tidak Ditemukan</Title>
        <Button type="primary" onClick={() => navigate('/customer/catalog')} className="btn-primary-terracotta" style={{ marginTop: '16px' }}>
          Kembali ke Katalog
        </Button>
      </Card>
    );
  }

  const product = presenter.product;
  const cartItem = cart.items.find((item) => item.product.id === product.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  return (
    <div className="customer-page-padding">
      <Button
        type="text"
        icon={<ArrowLeftOutlined style={{ fontSize: '18px', color: '#1C1917' }} />}
        onClick={() => navigate('/customer/catalog')}
        className="btn-back-circle"
      />

      <Card style={{ maxWidth: '840px', margin: '0 auto' }}>
        <Row gutter={[32, 24]} align="middle">
          <Col xs={24} md={10}>
            <div className="product-detail-image-box">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                <ShoppingOutlined style={{ fontSize: '72px', color: 'var(--color-secondary)' }} />
              )}
            </div>
          </Col>

          <Col xs={24} md={14}>
            <div className="product-info-column">
              <div>
                <span className="badge-category">{product.category.name}</span>
              </div>

              <Title level={2} className="subhead-text" style={{ margin: 0 }}>{product.name}</Title>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <code className="code-text" style={{ color: '#57534E' }}>SKU: {product.sku}</code>
                {product.stock === 0 && (
                  <span className="stock-badge-out">Stok Habis</span>
                )}
              </div>

              <div className="product-price-section">
                <Text className="product-price-text">{formatCurrency(product.price)}</Text>
              </div>

              <div>
                <Paragraph className="body-small" style={{ color: '#57534E', margin: 0 }}>
                  {product.description || 'Barang berkualitas tinggi yang diproduksi dengan standar terbaik. Detail spesifikasi dan kualitas terjamin.'}
                </Paragraph>
              </div>

              <div style={{ marginTop: '16px' }}>
                {quantityInCart === 0 ? (
                  <Button
                    type="primary"
                    size="large"
                    block
                    disabled={product.stock === 0}
                    onClick={() => onAddToCart(product)}
                    className="btn-primary-terracotta"
                    style={{ height: '46px', fontSize: '15px' }}
                  >
                    {product.stock === 0 ? 'Stok Habis' : 'Tambah ke Keranjang'}
                  </Button>
                ) : (
                  <div className="qty-controller" style={{ height: '46px', padding: '0 16px', justifyContent: 'space-between' }}>
                    <Button
                      type="text"
                      icon={<MinusOutlined style={{ fontSize: '14px', color: 'var(--color-primary)' }} />}
                      onClick={() => cart.updateQuantity(product.id, quantityInCart - 1)}
                      className="qty-controller-btn"
                      style={{ height: '100%', padding: '0 8px' }}
                    />
                    <Text strong style={{ fontSize: '15px', color: '#1C1917' }}>
                      {quantityInCart} dalam Keranjang
                    </Text>
                    <Button
                      type="text"
                      icon={<PlusOutlined style={{ fontSize: '14px', color: 'var(--color-primary)' }} />}
                      disabled={quantityInCart >= product.stock}
                      onClick={() => cart.updateQuantity(product.id, quantityInCart + 1)}
                      className="qty-controller-btn"
                      style={{ height: '100%', padding: '0 8px' }}
                    />
                  </div>
                )}
              </div>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default ProductDetailView;
