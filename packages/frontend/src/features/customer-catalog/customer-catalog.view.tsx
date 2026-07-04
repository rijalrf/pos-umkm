import React, { useEffect, useState } from 'react';
import { Col, Row, Input, Button, Spin, Empty, Typography } from 'antd';
import { SearchOutlined, ShoppingOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useCustomerCatalogPresenter } from './customer-catalog.presenter';
import { useCustomerCartStore } from '../../stores/customer-cart.store';
import { formatCurrency } from '../../libs/format.lib';
import type { CustomerProductItem, CustomerOutletContext } from './customer-catalog.types';

const { Text } = Typography;

export const CatalogView: React.FC = () => {
  const navigate = useNavigate();
  const cart = useCustomerCartStore();
  const { onAddToCart } = useOutletContext<CustomerOutletContext>();
  const presenter = useCustomerCatalogPresenter();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);

  useEffect(() => {
    presenter.fetchProducts();
    presenter.fetchCategories();
    presenter.fetchStoreInfo();
  }, [presenter.fetchProducts, presenter.fetchCategories, presenter.fetchStoreInfo]);

  const handleSearch = (val: string) => {
    setSearch(val);
    presenter.fetchProducts({ search: val, categoryId: selectedCategory });
  };

  const handleCategoryChange = (val: string) => {
    const catId = val === 'ALL' ? undefined : val;
    setSelectedCategory(catId);
    presenter.fetchProducts({ search, categoryId: catId });
  };

  const storeName = presenter.storeInfo?.storeName || 'POS UMKM';
  const storeAddress = presenter.storeInfo?.address || '';
  const storeLogo = presenter.storeInfo?.logoUrl || null;

  return (
    <div className="customer-page-padding">
      <div className="store-brand-banner">
        <div className="store-logo-circle">
          {storeLogo ? (
            <img src={storeLogo} alt={storeName} />
          ) : (
            <span style={{ fontSize: '18px', color: 'var(--color-primary)' }}>🏪</span>
          )}
        </div>
        <div className="store-info-column">
          <h1 className="store-name-text">{storeName}</h1>
          {storeAddress && (
            <p className="store-address-text">{storeAddress}</p>
          )}
        </div>
      </div>

      <div className="search-bar-wrapper">
        <Input
          placeholder="Cari produk..."
          prefix={<SearchOutlined style={{ color: '#A8A29E' }} />}
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="category-scroll-container">
        <div
          onClick={() => handleCategoryChange('ALL')}
          className={`filter-chip${selectedCategory === undefined ? ' filter-chip-selected' : ''}`}
        >
          Semua Kategori
        </div>
        {presenter.categories.map((c) => {
          const isSelected = selectedCategory === c.id;
          return (
            <div
              key={c.id}
              onClick={() => handleCategoryChange(c.id)}
              className={`filter-chip${isSelected ? ' filter-chip-selected' : ''}`}
            >
              {c.name}
            </div>
          );
        })}
      </div>

      <Spin spinning={presenter.loading}>
        {presenter.products.length > 0 ? (
          <Row gutter={[16, 16]}>
            {presenter.products.map((p: CustomerProductItem) => {
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
                    className={`product-catalog-card${isOutOfStock ? ' product-catalog-card-out' : ' product-catalog-card-in'}`}
                    style={{
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
                  >
                    <div className="catalog-card-cover">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} className="product-catalog-card-img" />
                      ) : (
                        <ShoppingOutlined style={{ fontSize: '48px', color: 'var(--color-secondary)' }} />
                      )}
                    </div>
                    <div className="catalog-card-body">
                      <div className="flex-column" style={{ flex: 1, gap: '8px' }}>
                        <div className="catalog-card-title" style={{ color: '#1C1917' }}>
                          {p.name}
                        </div>

                        <div style={{ marginTop: 'auto', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text className="catalog-card-price" style={{ margin: 0 }}>
                            {formatCurrency(p.price)}
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
                                backgroundColor: 'var(--color-primary)',
                                borderColor: 'var(--color-primary)',
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
                              className="qty-controller"
                            >
                              <Button
                                type="text"
                                size="small"
                                icon={<MinusOutlined style={{ fontSize: '12px', color: 'var(--color-primary)' }} />}
                                onClick={() => cart.updateQuantity(p.id, quantityInCart - 1)}
                                className="qty-controller-btn"
                              />
                              <Text strong style={{ fontSize: '13px', color: '#1C1917', minWidth: '14px', textAlign: 'center' }}>
                                {quantityInCart}
                              </Text>
                              <Button
                                type="text"
                                size="small"
                                icon={<PlusOutlined style={{ fontSize: '12px', color: 'var(--color-primary)' }} />}
                                disabled={quantityInCart >= p.stock}
                                onClick={() => cart.updateQuantity(p.id, quantityInCart + 1)}
                                className="qty-controller-btn"
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
            className="empty-state"
          />
        )}
      </Spin>
    </div>
  );
};

export default CatalogView;
