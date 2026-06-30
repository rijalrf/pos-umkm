import React, { useEffect } from 'react';
import { Card, Col, Row, Button, Spin, Typography, Breadcrumb, Avatar } from 'antd';
import { ArrowLeftOutlined, EnvironmentOutlined, SafetyOutlined, InfoCircleOutlined, UserOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useCustomerPresenter } from './customer.presenter';
import { getArtisanProfile } from './catalog.view';

const { Title, Text, Paragraph } = Typography;

export const ProductDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
        <Title level={3} style={{ fontFamily: "'Playfair Display', serif" }}>Produk Tidak Ditemukan</Title>
        <Button type="primary" onClick={() => navigate('/customer/catalog')} style={{ backgroundColor: '#C2410C', borderColor: '#C2410C', marginTop: '16px' }}>
          Kembali ke Katalog
        </Button>
      </Card>
    );
  }

  const artisan = getArtisanProfile(product.name, product.sku);

  // Status stock
  let stockColor = '#DCFCE7';
  let stockTextColor = '#166534';
  let stockText = 'Stok Tersedia';
  
  if (product.stock === 0) {
    stockColor = '#FEE2E2';
    stockTextColor = '#991B1B';
    stockText = 'Stok Habis';
  } else if (product.stock <= 5) {
    stockColor = '#FEF3C7';
    stockTextColor = '#92400E';
    stockText = `Stok Terbatas (${product.stock} tersisa)`;
  } else {
    stockText = `Stok Tersedia (${product.stock} pcs)`;
  }

  return (
    <div>
      {/* Breadcrumbs */}
      <Breadcrumb style={{ marginBottom: '24px', fontFamily: "'Inter', sans-serif" }}>
        <Breadcrumb.Item>
          <a onClick={() => navigate('/customer/catalog')}>Katalog</a>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{product.category.name}</Breadcrumb.Item>
        <Breadcrumb.Item>{product.name}</Breadcrumb.Item>
      </Breadcrumb>

      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/customer/catalog')}
        style={{ color: '#57534E', padding: 0, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
      >
        Kembali ke Katalog
      </Button>

      <Row gutter={[32, 32]}>
        {/* Left Column: Product Image */}
        <Col xs={24} md={12}>
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #D6D3D1',
            borderRadius: '12px',
            padding: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '360px',
            maxHeight: '480px',
            overflow: 'hidden',
          }}>
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                style={{
                  width: '100%',
                  maxHeight: '400px',
                  objectFit: 'contain',
                }}
              />
            ) : (
              <SafetyOutlined style={{ fontSize: '96px', color: '#D4A373' }} />
            )}
          </div>
        </Col>

        {/* Right Column: Product Info & Storytelling */}
        <Col xs={24} md={12}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Category tag */}
            <div>
              <span style={{
                background: '#FFFBF5',
                border: '1px solid #D6D3D1',
                padding: '4px 12px',
                borderRadius: '4px',
                fontSize: '12px',
                color: '#365314',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                {product.category.name}
              </span>
            </div>

            {/* Product Name */}
            <Title level={1} style={{
              fontFamily: "'Playfair Display', serif",
              color: '#1C1917',
              fontSize: '32px',
              margin: '0',
              lineHeight: '1.2',
            }}>
              {product.name}
            </Title>

            {/* SKU and Stock info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <code style={{ fontFamily: "'Source Code Pro', monospace", fontSize: '13px', color: '#57534E' }}>
                SKU: {product.sku}
              </code>
              <span style={{
                background: stockColor,
                color: stockTextColor,
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 600,
              }}>
                {stockText}
              </span>
            </div>

            {/* Price */}
            <div style={{
              borderTop: '1px solid #E7E5E4',
              borderBottom: '1px solid #E7E5E4',
              padding: '16px 0',
              margin: '8px 0',
            }}>
              <Title level={2} style={{
                color: '#C2410C',
                fontFamily: "'Inter', sans-serif",
                fontWeight: 'bold',
                margin: 0,
              }}>
                {formatter.format(Number(product.price))}
              </Title>
            </div>

            {/* Description */}
            <div>
              <Title level={5} style={{ fontFamily: "'Playfair Display', serif", color: '#1C1917', marginBottom: '8px' }}>
                Cerita di Balik Produk
              </Title>
              <Paragraph style={{
                fontFamily: "'Inter', sans-serif",
                color: '#57534E',
                fontSize: '15px',
                lineHeight: '1.7',
                textAlign: 'justify',
              }}>
                {product.description || 'Barang kerajinan berkualitas tinggi yang dibuat langsung oleh tangan perajin lokal berpengalaman menggunakan bahan baku lokal alami ramah lingkungan. Setiap guratan dan jahitan mencerminkan kecintaan terhadap kebudayaan Nusantara.'}
              </Paragraph>
            </div>

            {/* Artisan Profile Card (MarketNest Unique Feature) */}
            <Card
              style={{
                background: '#FFFBF5',
                borderColor: '#D6D3D1',
                borderWidth: '2px',
                borderRadius: '8px',
                marginTop: '16px',
              }}
              bodyStyle={{ padding: '16px' }}
            >
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <Avatar size={48} style={{ backgroundColor: '#C2410C' }} icon={<UserOutlined />} />
                <div>
                  <Title level={5} style={{ fontFamily: "'Playfair Display', serif", margin: '0 0 4px 0', color: '#1C1917' }}>
                    Dibuat Oleh: {artisan.name}
                  </Title>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <EnvironmentOutlined style={{ color: '#D4A373', fontSize: '12px' }} />
                    <Text style={{ fontSize: '12px', color: '#57534E', fontStyle: 'italic' }}>
                      {artisan.city}
                    </Text>
                  </div>
                  <Paragraph style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: '#57534E', margin: 0, lineHeight: '1.5' }}>
                    {artisan.bio}
                  </Paragraph>
                </div>
              </div>
            </Card>

            {/* Additional info badges */}
            <div style={{ display: 'flex', gap: '24px', marginTop: '16px', borderTop: '1px solid #E7E5E4', paddingTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <SafetyOutlined style={{ color: '#365314', fontSize: '18px' }} />
                <Text style={{ fontSize: '13px', color: '#57534E' }}>Jaminan Keaslian 100%</Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <InfoCircleOutlined style={{ color: '#365314', fontSize: '18px' }} />
                <Text style={{ fontSize: '13px', color: '#57534E' }}>Pengiriman Aman Nusantara</Text>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default ProductDetailView;
