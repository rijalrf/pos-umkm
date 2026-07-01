import React, { useEffect, useState } from 'react';
import { Col, Row, Input, Button, Spin, Empty, Typography } from 'antd';
import { SearchOutlined, ShoppingOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useCustomerPresenter } from './customer.presenter';
import { useCustomerCartStore } from '../../stores/customer-cart.store';
import { CustomerService } from './customer.service';

const { Text } = Typography;

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
  const [storeName, setStoreName] = useState<string>('POS UMKM');
  const [storeAddress, setStoreAddress] = useState<string>('');
  const [storeLogo, setStoreLogo] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    CustomerService.getPublicStoreInfo()
      .then((res) => {
        if (res?.data?.storeName) setStoreName(res.data.storeName);
        if (res?.data?.address) setStoreAddress(res.data.address);
        if (res?.data?.logoUrl) setStoreLogo(res.data.logoUrl);
      })
      .catch(() => {});
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
      {/* Store Brand Banner (Compact) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px 0',
          marginBottom: '16px',
          borderBottom: '1px solid #E7E5E4',
        }}
      >
        {/* Store Logo */}
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: '#FFFBF5',
            border: '1.5px solid #D4A373',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            overflow: 'hidden',
          }}
        >
          {storeLogo ? (
            <img src={storeLogo} alt={storeName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: '18px', color: '#C2410C' }}>🏪</span>
          )}
        </div>
        
        {/* Store Info */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h1
            style={{
              fontFamily: 'var(--font-headline)',
              fontSize: '20px',
              fontWeight: 700,
              color: '#1C1917',
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {storeName}
          </h1>
          {storeAddress && (
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                color: '#57534E',
                margin: 0,
                lineHeight: 1.4,
              }}
            >
              {storeAddress}
            </p>
          )}
        </div>
      </div>

      {/* Search Input bar */}
      <div style={{ marginBottom: '16px' }}>
        <Input
          placeholder="Cari produk..."
          prefix={<SearchOutlined style={{ color: '#A8A29E' }} />}
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          style={{
            width: '100%',
            height: '42px',
            borderRadius: '4px',
            borderColor: '#D6D3D1',
          }}
        />
      </div>

      {/* Category Horizontal Filter Tags */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '12px',
          marginBottom: '20px',
          scrollbarWidth: 'none', // For Firefox
          msOverflowStyle: 'none', // For IE/Edge
        }}
        className="category-scroll-container"
      >
        <style dangerouslySetInnerHTML={{__html: `
          .category-scroll-container::-webkit-scrollbar {
            display: none; /* For Chrome, Safari, and Opera */
          }
        `}} />
        
        {/* "Semua Kategori" Tag */}
        <div
          onClick={() => handleCategoryChange('ALL')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            height: '32px',
            padding: '0 14px',
            borderRadius: '4px',
            border: selectedCategory === undefined ? '1px solid #C2410C' : '1px solid #D6D3D1',
            backgroundColor: selectedCategory === undefined ? '#C2410C' : '#FFFFFF',
            color: selectedCategory === undefined ? '#FFFFFF' : '#1C1917',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '13px',
            userSelect: 'none',
            flexShrink: 0,
            transition: 'all 0.2s ease',
          }}
        >
          Semua Kategori
        </div>

        {/* Dynamic Category Tags */}
        {categories.map((c) => {
          const isSelected = selectedCategory === c.id;
          return (
            <div
              key={c.id}
              onClick={() => handleCategoryChange(c.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                height: '32px',
                padding: '0 14px',
                borderRadius: '4px',
                border: isSelected ? '1px solid #C2410C' : '1px solid #D6D3D1',
                backgroundColor: isSelected ? '#C2410C' : '#FFFFFF',
                color: isSelected ? '#FFFFFF' : '#1C1917',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '13px',
                userSelect: 'none',
                flexShrink: 0,
                transition: 'all 0.2s ease',
              }}
            >
              {c.name}
            </div>
          );
        })}
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
                      background: isOutOfStock ? '#F5F5F4' : '#FFFFFF',
                      border: '1px solid #E7E5E4',
                      borderRadius: '8px',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden',
                      filter: isOutOfStock ? 'grayscale(100%)' : 'none',
                      opacity: isOutOfStock ? 0.5 : 1,
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
                            objectFit: 'cover',
                            padding: 0,
                          }}
                        />
                      ) : (
                        <ShoppingOutlined style={{ fontSize: '48px', color: '#D4A373' }} />
                      )}
                    </div>
                    <div className="catalog-card-body">
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>

                        {/* Product Name */}
                        <div
                          className="catalog-card-title"
                          style={{
                            margin: 0,
                            fontFamily: 'var(--font-body)',
                            fontWeight: 600,
                            color: '#1C1917',
                          }}
                        >
                          {p.name}
                        </div>

                        {/* Price & Cart Actions */}
                        <div style={{ marginTop: 'auto', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text className="catalog-card-price" style={{ margin: 0 }}>
                            {formatter.format(Number(p.price))}
                          </Text>

                          {quantityInCart === 0 ? (
                            !isOutOfStock && (
                            <Button
                              type="primary"
                              icon={<PlusOutlined style={{ fontSize: '15px' }} />}
                              onClick={(e) => {
                                e.stopPropagation();
                                onAddToCart(p);
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
                            )
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
