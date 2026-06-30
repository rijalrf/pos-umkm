import React, { useEffect } from 'react';
import { Card, Col, Row, Button, Spin, Typography } from 'antd';
import { ShoppingOutlined, MinusOutlined, PlusOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { useCustomerPresenter } from './customer.presenter';
import { useCustomerCartStore } from '../../stores/customer-cart.store';

const { Title, Paragraph, Text } = Typography;

export const ProductDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const cart = useCustomerCartStore();
  const { onAddToCart } = useOutletContext<{ onAddToCart: (product: any) => void }>();
  const {
    loading,
    product,
    fetchProductById,
  } = useCustomerPresenter();

  useEffect(() => {
    if (id) {
      fetchProductById(id);
    }
  }, [id, fetchProductById]);

  const formatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!product) {
    return (
      <Card style={{ textAlign: 'center', padding: '40px', borderColor: '#E7E5E4' }}>
        <Title level={3} style={{ fontFamily: 'var(--font-headline)' }}>Produk Tidak Ditemukan</Title>
        <Button type="primary" onClick={() => navigate('/customer/catalog')} style={{ backgroundColor: '#C2410C', borderColor: '#C2410C', marginTop: '16px' }}>
          Kembali ke Katalog
        </Button>
      </Card>
    );
  }

  const cartItem = cart.items.find((item) => item.product.id === product.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  return (
    <div style={{ padding: '0 16px' }}>
      <Button
        type="text"
        icon={<ArrowLeftOutlined style={{ fontSize: '18px', color: '#1C1917' }} />}
        onClick={() => navigate('/customer/catalog')}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          border: '1px solid #D6D3D1',
          backgroundColor: '#FFFFFF',
          marginBottom: '20px',
          boxShadow: 'none',
        }}
      />

      <Card
        style={{
          maxWidth: '840px',
          margin: '0 auto',
          borderColor: '#E7E5E4',
          borderRadius: '12px',
          background: '#FFFFFF',
        }}
        styles={{ body: { padding: '24px' } }}
      >
        <Row gutter={[32, 24]} align="middle">
          {/* Left Column: Product Image */}
          <Col xs={24} md={10}>
            <div style={{
              background: '#FFFBF5',
              border: '1px solid #E7E5E4',
              borderRadius: '8px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '280px',
              overflow: 'hidden',
            }}>
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                />
              ) : (
                <ShoppingOutlined style={{ fontSize: '72px', color: '#D4A373' }} />
              )}
            </div>
          </Col>

          {/* Right Column: Product Info & Actions */}
          <Col xs={24} md={14}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Category tag */}
              <div>
                <span style={{
                  background: '#FFFBF5',
                  border: '1px solid #D6D3D1',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  color: '#365314',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  {product.category.name}
                </span>
              </div>

              {/* Product Name */}
              <Title level={2} style={{
                fontFamily: 'var(--font-headline)',
                color: '#1C1917',
                fontSize: '26px',
                margin: '0',
                lineHeight: '1.2',
              }}>
                {product.name}
              </Title>

              {/* SKU and Stock info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <code style={{ fontFamily: "'Source Code Pro', monospace", fontSize: '12px', color: '#57534E' }}>
                  SKU: {product.sku}
                </code>
                {product.stock === 0 && (
                  <span style={{
                    background: '#FEE2E2',
                    color: '#991B1B',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 600,
                  }}>
                    Stok Habis
                  </span>
                )}
              </div>

              {/* Price */}
              <div style={{
                borderTop: '1px solid #E7E5E4',
                borderBottom: '1px solid #E7E5E4',
                padding: '12px 0',
                margin: '4px 0',
              }}>
                <Text style={{
                  color: '#C2410C',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 'bold',
                  fontSize: '22px',
                  display: 'block',
                }}>
                  {formatter.format(Number(product.price))}
                </Text>
              </div>

              {/* Description */}
              <div>
                <Paragraph style={{
                  fontFamily: 'var(--font-body)',
                  color: '#57534E',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  margin: 0,
                }}>
                  {product.description || 'Barang berkualitas tinggi yang diproduksi dengan standar terbaik. Detail spesifikasi dan kualitas terjamin.'}
                </Paragraph>
              </div>

              {/* Checkout Action Button / Quantity Controller */}
              <div style={{ marginTop: '16px' }}>
                {quantityInCart === 0 ? (
                  <Button
                    type="primary"
                    size="large"
                    block
                    disabled={product.stock === 0}
                    onClick={() => onAddToCart(product)}
                    style={{
                      backgroundColor: '#C2410C',
                      borderColor: '#C2410C',
                      fontWeight: 600,
                      height: '46px',
                      borderRadius: '4px',
                      fontSize: '15px',
                    }}
                  >
                    {product.stock === 0 ? 'Stok Habis' : 'Tambah ke Keranjang'}
                  </Button>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#FFFBF5',
                      border: '1.5px solid #C2410C',
                      borderRadius: '4px',
                      height: '46px',
                      padding: '0 16px',
                    }}
                  >
                    <Button
                      type="text"
                      icon={<MinusOutlined style={{ fontSize: '14px', color: '#C2410C' }} />}
                      onClick={() => cart.updateQuantity(product.id, quantityInCart - 1)}
                      style={{ height: '100%', padding: '0 8px', display: 'flex', alignItems: 'center' }}
                    />
                    <Text strong style={{ fontSize: '15px', color: '#1C1917' }}>
                      {quantityInCart} dalam Keranjang
                    </Text>
                    <Button
                      type="text"
                      icon={<PlusOutlined style={{ fontSize: '14px', color: '#C2410C' }} />}
                      disabled={quantityInCart >= product.stock}
                      onClick={() => cart.updateQuantity(product.id, quantityInCart + 1)}
                      style={{ height: '100%', padding: '0 8px', display: 'flex', alignItems: 'center' }}
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
