import React, { useEffect, useState } from 'react';
import { Col, Row, Input, Select, Button, Spin, Empty, Typography } from 'antd';
import { SearchOutlined, ShoppingOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useCustomerPresenter } from './customer.presenter';
import { useCustomerCartStore } from '../../stores/customer-cart.store';

const { Title, Text } = Typography;
const { Option } = Select;

export const CatalogView: React.FC = () => {
  const navigate = useNavigate();
  const cart = useCustomerCartStore();
  const { onAddToCart } = useOutletContext<{ onAddToCart: (product: any) => void }>();
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
    <div style={{ padding: '0 16px' }}>
      {/* Search & Filter bar */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E7E5E4',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '24px',
      }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Input
            placeholder="Cari produk..."
            prefix={<SearchOutlined style={{ color: '#A8A29E' }} />}
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            style={{
              flex: 2,
              minWidth: '200px',
              height: '42px',
              borderRadius: '4px',
              borderColor: '#D6D3D1',
            }}
          />
          <Select
            placeholder="Pilih Kategori"
            defaultValue="ALL"
            onChange={handleCategoryChange}
            style={{
              flex: 1,
              minWidth: '150px',
              height: '42px',
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
          <Row gutter={[16, 16]}>
            {products.map((p) => {
              const isOutOfStock = p.stock === 0;
              const cartItem = cart.items.find((item) => item.product.id === p.id);
              const quantityInCart = cartItem ? cartItem.quantity : 0;

              return (
                <Col xs={12} sm={12} md={8} lg={6} key={p.id}>
                  <div
                    onClick={() => {
                      if (!isOutOfStock) {
                        navigate(`/customer/product/${p.id}`);
                      }
                    }}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E7E5E4',
                      borderRadius: '8px',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden',
                      opacity: isOutOfStock ? 0.6 : 1,
                      cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                    }}
                    className="product-catalog-card"
                  >
                    <div className="catalog-card-cover">
                      {p.imageUrl ? (
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            padding: '12px',
                          }}
                        />
                      ) : (
                        <ShoppingOutlined style={{ fontSize: '48px', color: '#D4A373' }} />
                      )}
                    </div>
                    <div className="catalog-card-body">
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
                        <Title level={4} className="catalog-card-title" style={{
                          margin: 0,
                          fontFamily: "'Playfair Display', serif",
                          color: '#1C1917'
                        }}>
                          {p.name}
                        </Title>

                        {/* Price & Cart Actions */}
                        <div style={{ marginTop: 'auto', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text className="catalog-card-price">
                            {formatter.format(Number(p.price))}
                          </Text>

                          {quantityInCart === 0 ? (
                            <Button
                              type="primary"
                              icon={<PlusOutlined style={{ fontSize: '15px' }} />}
                              disabled={isOutOfStock}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!isOutOfStock) {
                                  onAddToCart(p);
                                }
                              }}
                              style={{
                                backgroundColor: '#C2410C',
                                borderColor: '#C2410C',
                                borderRadius: '4px',
                                width: '32px',
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 0,
                              }}
                            />
                          ) : (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: '#FFFBF5',
                                border: '1.5px solid #C2410C',
                                borderRadius: '4px',
                                height: '32px',
                                padding: '2px 4px',
                              }}
                            >
                              <Button
                                type="text"
                                size="small"
                                icon={<MinusOutlined style={{ fontSize: '12px', color: '#C2410C' }} />}
                                onClick={() => cart.updateQuantity(p.id, quantityInCart - 1)}
                                style={{
                                  padding: 0,
                                  width: '20px',
                                  height: '20px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              />
                              <Text strong style={{ fontSize: '13px', color: '#1C1917', minWidth: '14px', textAlign: 'center' }}>
                                {quantityInCart}
                              </Text>
                              <Button
                                type="text"
                                size="small"
                                icon={<PlusOutlined style={{ fontSize: '12px', color: '#C2410C' }} />}
                                disabled={quantityInCart >= p.stock}
                                onClick={() => cart.updateQuantity(p.id, quantityInCart + 1)}
                                style={{
                                  padding: 0,
                                  width: '20px',
                                  height: '20px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
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
