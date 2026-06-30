import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Input, Select, Button, Spin, Empty, Typography } from 'antd';
import { SearchOutlined, EnvironmentOutlined, ArrowRightOutlined, ShoppingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useCustomerPresenter } from './customer.presenter';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

// Helper to get deterministic artisan maker profile for each product based on name/sku
export const getArtisanProfile = (productName: string, sku: string) => {
  const hash = productName.length + sku.charCodeAt(0 || 0);
  
  const artisans = [
    { name: 'Abdi Studio', city: 'Sleman, D.I. Yogyakarta', bio: 'Sanggar tembikar tradisional dengan tanah liat lokal pilihan.' },
    { name: 'Tenun Lestari', city: 'Jepara, Jawa Tengah', bio: 'Penenun generasi ketiga yang menjaga warisan motif pesisiran.' },
    { name: 'Kriya Wana', city: 'Gianyar, Bali', bio: 'Karya pahat kayu ramah lingkungan dari pohon kelapa tumbang.' },
    { name: 'Sekar Bumi', city: 'Bantul, D.I. Yogyakarta', bio: 'Pewarnaan benang alami menggunakan daun indigo dan kunyit.' }
  ];

  return artisans[hash % artisans.length];
};

export const CatalogView: React.FC = () => {
  const navigate = useNavigate();
  const {
    loading,
    products,
    categories,
    fetchProducts,
    fetchCategories,
  } = useCustomerPresenter();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const handleSearch = (val: string) => {
    setSearch(val);
    fetchProducts({ search: val, categoryId: selectedCategory });
  };

  const handleCategoryChange = (val: string) => {
    const catId = val === 'ALL' ? undefined : val;
    setSelectedCategory(catId);
    fetchProducts({ search, categoryId: catId });
  };

  const formatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  });

  return (
    <div>
      {/* Hero Banner Section */}
      <div style={{
        background: '#FDF6EC',
        border: '1px solid #D4A373',
        borderRadius: '12px',
        padding: '40px 32px',
        marginBottom: '32px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ maxWidth: '640px', position: 'relative', zIndex: 1 }}>
          <Text style={{
            color: '#C2410C',
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            display: 'block',
            marginBottom: '8px',
          }}>
            Karya Tangan Pengrajin Nusantara
          </Text>
          <Title level={1} style={{
            fontFamily: "'Playfair Display', serif",
            color: '#1C1917',
            margin: '0 0 16px 0',
            fontSize: '38px',
            lineHeight: '1.2',
          }}>
            Setiap Karya Memiliki Cerita
          </Title>
          <Paragraph style={{
            fontFamily: "'Inter', sans-serif",
            color: '#57534E',
            fontSize: '16px',
            lineHeight: '1.6',
            margin: 0,
          }}>
            Selamat datang di MarketNest. Jelajahi koleksi barang pecah belah, dekorasi rumah,
            dan kain tenun asli buatan tangan yang dibuat dengan penuh dedikasi oleh perajin lokal Indonesia.
          </Paragraph>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px',
      }}>
        <div style={{ display: 'flex', gap: '12px', flex: 1, minWidth: '280px', maxWidth: '600px' }}>
          <Input
            placeholder="Cari kerajinan tangan..."
            prefix={<SearchOutlined style={{ color: '#A8A29E' }} />}
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            style={{
              height: '42px',
              borderRadius: '4px',
              borderColor: '#D6D3D1',
              flex: 2,
            }}
          />
          <Select
            placeholder="Semua Kategori"
            defaultValue="ALL"
            onChange={handleCategoryChange}
            style={{
              height: '42px',
              flex: 1,
            }}
          >
            <Option value="ALL">Semua Kategori</Option>
            {categories.map((c) => (
              <Option key={c.id} value={c.id}>{c.name}</Option>
            ))}
          </Select>
        </div>
      </div>

      {/* Product List Grid */}
      <Spin spinning={loading}>
        {products.length > 0 ? (
          <Row gutter={[24, 24]}>
            {products.map((p) => {
              const artisan = getArtisanProfile(p.name, p.sku);
              return (
                <Col xs={24} sm={12} md={8} lg={6} key={p.id}>
                  <Card
                    hoverable
                    onClick={() => navigate(`/customer/product/${p.id}`)}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E7E5E4',
                      borderRadius: '8px',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                    bodyStyle={{
                      padding: '16px',
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                    cover={
                      <div style={{
                        height: '200px',
                        background: '#FFFBF5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        borderBottom: '1px solid #E7E5E4',
                        borderTopLeftRadius: '8px',
                        borderTopRightRadius: '8px',
                      }}>
                        {p.imageUrl ? (
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        ) : (
                          <ShoppingOutlined style={{ fontSize: '48px', color: '#D4A373' }} />
                        )}
                      </div>
                    }
                  >
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                          {p.category.name}
                        </span>
                      </div>

                      {/* Product Name */}
                      <Title level={4} style={{
                        margin: '4px 0 0 0',
                        fontSize: '17px',
                        fontFamily: "'Playfair Display', serif",
                        color: '#1C1917',
                        lineHeight: '1.3',
                      }}>
                        {p.name}
                      </Title>

                      {/* Artisan Provenance */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                        <EnvironmentOutlined style={{ color: '#D4A373', fontSize: '12px' }} />
                        <Text style={{ fontSize: '12px', color: '#57534E' }}>
                          {artisan.name} &bull; <span style={{ fontStyle: 'italic' }}>{artisan.city}</span>
                        </Text>
                      </div>

                      {/* Price */}
                      <div style={{ marginTop: 'auto', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{
                          fontSize: '18px',
                          fontWeight: 'bold',
                          color: '#C2410C',
                          fontFamily: "'Inter', sans-serif",
                        }}>
                          {formatter.format(Number(p.price))}
                        </Text>
                        <Button
                          type="text"
                          icon={<ArrowRightOutlined />}
                          style={{ color: '#C2410C', padding: 0 }}
                        />
                      </div>
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Tidak ada kerajinan tangan yang ditemukan"
            style={{ padding: '60px 0' }}
          />
        )}
      </Spin>
    </div>
  );
};

export default CatalogView;
