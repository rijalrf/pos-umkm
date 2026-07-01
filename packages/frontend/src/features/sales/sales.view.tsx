import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Row, Col, Card, Input, Button, Divider, InputNumber, Modal, message, Radio, Typography, Tag, Empty, Grid, Space } from 'antd';
import { SearchOutlined, ShoppingCartOutlined, PlusOutlined, MinusOutlined, DeleteOutlined, PrinterOutlined, UserOutlined, PhoneOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useCartStore } from '../../stores/cart.store';
import { ProductsService } from '../products/products.service';
import { CategoriesService } from '../categories/categories.service';
import { SalesService } from './sales.service';
import { ProductItem } from '../products/products.presenter';

const { Title, Text, Paragraph } = Typography;

export const SalesView: React.FC = () => {
  const cart = useCartStore();
  const screens = Grid.useBreakpoint();
  const isMobile = screens.md === false;

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Checkout states
  const [customerType, setCustomerType] = useState<'guest' | 'member'>('guest');
  const [customerName, setCustomerName] = useState('Guest');
  const [customerId, setCustomerId] = useState<string | undefined>(undefined);
  const [cashReceived, setCashReceived] = useState<number>(0);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Member phone search states
  const [phoneSearch, setPhoneSearch] = useState('');
  const [searchingMember, setSearchingMember] = useState(false);
  const [searchedMemberResult, setSearchedMemberResult] = useState<any | null>(null);

  // Input refs for auto-focus
  const guestInputRef = useRef<any>(null);
  const phoneInputRef = useRef<any>(null);

  // Receipt Modal
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [createdTransactionId, setCreatedTransactionId] = useState<string | null>(null);

  const handleSearchMember = async () => {
    if (!phoneSearch.trim()) {
      message.warning('Silakan masukkan nomor HP member terlebih dahulu!');
      return;
    }

    setSearchingMember(true);
    setCustomerId(undefined);
    setSearchedMemberResult(null);

    try {
      const res = await SalesService.searchCustomerByPhone(phoneSearch.trim());
      if (res.success && res.data) {
        setSearchedMemberResult(res.data);
        setCustomerId(res.data.id);
        setCustomerName(res.data.name);
        message.success(`Member ditemukan: ${res.data.name}`);
      } else {
        message.warning('Member dengan nomor HP tersebut tidak ditemukan!');
        setCustomerName('');
      }
    } catch (e: any) {
      console.error(e);
      const errMsg = e.response?.data?.message || 'Gagal mencari data member!';
      message.error(errMsg);
      setCustomerName('');
    } finally {
      setSearchingMember(false);
    }
  };

  // Fetch products and categories
  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        ProductsService.getAll({ page: 1, limit: 100 }),
        CategoriesService.getAll(),
      ]);

      if (prodRes.success) {
        setProducts(prodRes.data.products);
      }
      if (catRes.success) {
        setCategories(catRes.data);
      }
    } catch (error) {
      message.error('Failed to load catalog data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Filter products locally for instantaneous typing response and sort available stock first
  const filteredProducts = useMemo(() => {
    const list = products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.sku.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory ? product.categoryId === selectedCategory : true;
      return matchesSearch && matchesCategory;
    });

    // Sort: stock > 0 first, stock === 0 last
    return [...list].sort((a, b) => {
      const aAvailable = a.stock > 0 ? 1 : 0;
      const bAvailable = b.stock > 0 ? 1 : 0;
      return bAvailable - aAvailable;
    });
  }, [products, search, selectedCategory]);

  const handleAddToCart = (product: ProductItem) => {
    try {
      cart.addItem(product);
      message.success(`Berhasil menambahkan ${product.name} ke keranjang`);
    } catch (e: any) {
      message.error(e.message);
    }
  };

  const handleUpdateQty = (productId: string, newQty: number) => {
    try {
      cart.updateQuantity(productId, newQty);
    } catch (e: any) {
      message.error(e.message);
    }
  };

  const handleCheckout = async () => {
    if (cart.items.length === 0) {
      message.warning('Keranjang belanja kosong');
      return;
    }

    const total = cart.getTotalAmount();
    if (cashReceived < total) {
      message.error('Insufficient cash received');
      return;
    }

    setCheckoutLoading(true);
    try {
      const payload = {
        customerId: customerType === 'member' ? customerId : undefined,
        customerName: customerType === 'guest' ? customerName : undefined,
        items: cart.items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        cashReceived,
      };

      const response = await SalesService.createTransaction(payload);
      if (response.success && response.data) {
        const txId = response.data.transaction.id;
        setCreatedTransactionId(txId);
        setReceiptModalOpen(true);
        message.success('Transaction processed successfully!');
        
        // Reload products to refresh stock counts
        loadInitialData();
      } else {
        message.error(response.message || 'Failed to process transaction');
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Error processing transaction');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const totalAmount = cart.getTotalAmount();
  const changeAmount = Math.max(0, cashReceived - totalAmount);

  const formatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  });


  const resetSalesView = () => {
    cart.clearCart();
    setCashReceived(0);
    setCustomerName('Guest');
    setCustomerId(undefined);
    setCustomerType('guest');
    setPhoneSearch('');
    setSearchedMemberResult(null);
    setCreatedTransactionId(null);
    setReceiptModalOpen(false);
  };

  const handleCustomerTypeChange = (type: 'guest' | 'member') => {
    setCustomerType(type);
    if (type === 'guest') {
      setPhoneSearch('');
      setSearchedMemberResult(null);
      setCustomerId(undefined);
      setCustomerName('Guest');
      setTimeout(() => guestInputRef.current?.focus(), 50);
    } else {
      setCustomerId(undefined);
      setCustomerName('');
      setPhoneSearch('');
      setSearchedMemberResult(null);
      setTimeout(() => phoneInputRef.current?.focus(), 50);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: isMobile ? 'auto' : 'calc(100vh - 190px)',
      width: '100%'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <Title level={2} style={{ margin: 0, fontFamily: "'Inter', sans-serif", color: '#C2410C' }}>
            Kasir
          </Title>
          <Paragraph style={{ margin: 0, fontFamily: "'Inter', sans-serif", color: '#57534E' }}>
            Proses transaksi penjualan, kelola keranjang belanja, dan cetak struk.
          </Paragraph>
        </div>
      </div>

      <Row gutter={[16, 16]} style={{ flex: isMobile ? 'none' : 1, minHeight: 0 }}>
        {/* Left Side: Product Catalog */}
        <Col xs={24} md={14} style={{ display: 'flex', flexDirection: 'column', height: isMobile ? 'auto' : '100%', marginBottom: isMobile ? '16px' : '0' }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              border: '1px solid #E7E5E4',
              borderRadius: '8px',
              backgroundColor: '#FFFFFF',
              padding: '16px',
              minHeight: 0,
              overflow: 'hidden'
            }}
          >
            <div style={{ marginBottom: '16px' }}>
              <Input
                placeholder="Cari produk berdasarkan nama atau SKU..."
                prefix={<SearchOutlined style={{ color: '#A8A29E' }} />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ height: '42px', borderRadius: '4px' }}
                allowClear
              />
            </div>

            {/* Category Filter Chips */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '12px' }}>
              <Button
                type={selectedCategory === null ? 'primary' : 'default'}
                onClick={() => setSelectedCategory(null)}
                style={{
                  borderRadius: '4px',
                  backgroundColor: selectedCategory === null ? '#C2410C' : '#FFFFFF',
                  borderColor: selectedCategory === null ? '#C2410C' : '#D6D3D1',
                  color: selectedCategory === null ? '#FFFFFF' : '#1C1917',
                }}
              >
                Semua Kategori
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  type={selectedCategory === cat.id ? 'primary' : 'default'}
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    borderRadius: '4px',
                    backgroundColor: selectedCategory === cat.id ? '#C2410C' : '#FFFFFF',
                    borderColor: selectedCategory === cat.id ? '#C2410C' : '#D6D3D1',
                    color: selectedCategory === cat.id ? '#FFFFFF' : '#1C1917',
                  }}
                >
                  {cat.name}
                </Button>
              ))}
            </div>

            <Divider style={{ margin: '0 0 16px 0' }} />

            {/* Products Grid */}
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>Memuat katalog produk...</div>
              ) : filteredProducts.length === 0 ? (
                <Empty description="Produk tidak ditemukan" style={{ marginTop: '40px' }} />
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
                  {filteredProducts.map((product) => {
                    const isLowStock = product.stock <= product.stockAlertThreshold;
                    const isOutOfStock = product.stock === 0;

                    return (
                      <Card
                        key={product.id}
                        hoverable
                        onClick={() => !isOutOfStock && handleAddToCart(product)}
                        style={{
                          border: '1px solid #E7E5E4',
                          borderRadius: '8px',
                          opacity: isOutOfStock ? 0.6 : 1,
                          cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                        }}
                        bodyStyle={{ padding: '12px', display: 'flex', flexDirection: 'column', height: '100%' }}
                      >
                        {/* Product Image */}
                        <div style={{ height: '110px', backgroundColor: '#FFFBF5', border: '1px solid #E7E5E4', borderRadius: '4px', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', marginBottom: '8px', position: 'relative' }}>
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <ShoppingCartOutlined style={{ fontSize: '32px', color: '#D4A373' }} />
                          )}

                          {isOutOfStock && (
                            <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                              <Tag color="red">STOK HABIS</Tag>
                            </div>
                          )}
                        </div>

                        {/* Product Details */}
                        <div style={{ flex: 1 }}>
                          <Text type="secondary" style={{ fontSize: '10px', display: 'block' }}>{product.sku}</Text>
                          <Text strong style={{ fontSize: '14px', lineHeight: '1.2', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '34px', margin: '2px 0' }}>
                            {product.name}
                          </Text>
                        </div>

                        <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text style={{ color: '#C2410C', fontWeight: 'bold' }}>{formatter.format(Number(product.price))}</Text>
                          {isLowStock && !isOutOfStock && (
                            <Tag color="warning" style={{ fontSize: '9px', margin: 0 }}>Stok: {product.stock}</Tag>
                          )}
                          {!isLowStock && (
                            <Text type="secondary" style={{ fontSize: '11px' }}>Stok: {product.stock}</Text>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </Col>

        {/* Right Side: Cart and Checkout */}
        <Col xs={24} md={10} style={{ display: 'flex', flexDirection: 'column', height: isMobile ? 'auto' : '100%' }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              border: '1px solid #E7E5E4',
              borderRadius: '8px',
              backgroundColor: '#FFFFFF',
              padding: '16px',
              minHeight: 0,
              overflow: 'hidden'
            }}
          >
            <Title level={4} style={{ fontFamily: "'Inter', sans-serif", margin: '0 0 12px 0', display: 'flex', justifyContent: 'space-between' }}>
              <span><ShoppingCartOutlined /> Keranjang Belanja</span>
              <Button size="small" type="link" danger onClick={cart.clearCart} disabled={cart.items.length === 0}>
                Kosongkan
              </Button>
            </Title>

            {/* Cart Items List */}
            <div style={{
              flex: isMobile ? 'none' : 1,
              maxHeight: isMobile ? '300px' : 'none',
              overflowY: 'auto',
              border: '1px solid #E7E5E4',
              borderRadius: '4px',
              padding: '8px',
              marginBottom: '16px',
              backgroundColor: '#FFFBF5',
              minHeight: '120px'
            }}>
              {cart.items.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#A8A29E' }}>
                  Keranjang belanja kosong. Pilih produk di sebelah kiri.
                </div>
              ) : (
                cart.items.map((item) => (
                  <div
                    key={item.product.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px',
                      borderBottom: '1px solid #E7E5E4',
                      backgroundColor: '#FFFFFF',
                      marginBottom: '8px',
                      borderRadius: '4px',
                    }}
                  >
                    <div style={{ flex: 1, paddingRight: '8px' }}>
                      <Text strong style={{ fontSize: '14px', display: 'block' }}>{item.product.name}</Text>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {formatter.format(Number(item.product.price))} / unit
                      </Text>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Button
                        size="small"
                        icon={<MinusOutlined />}
                        onClick={() => handleUpdateQty(item.product.id, item.quantity - 1)}
                      />
                      <span style={{ fontWeight: 'bold', width: '20px', textAlign: 'center' }}>{item.quantity}</span>
                      <Button
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={() => handleUpdateQty(item.product.id, item.quantity + 1)}
                      />
                      <Button
                        size="small"
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => cart.removeItem(item.product.id)}
                        style={{ marginLeft: '4px' }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Customer Settings */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ marginBottom: '8px' }}>
                <Text strong style={{ fontSize: '13px' }}>Tipe Pelanggan</Text>
              </div>
              <Radio.Group value={customerType} onChange={(e) => handleCustomerTypeChange(e.target.value as any)} style={{ marginBottom: '10px' }}>
                <Radio value="guest">Tamu</Radio>
                <Radio value="member">Member</Radio>
              </Radio.Group>

              {customerType === 'guest' ? (
                <Input
                  ref={guestInputRef}
                  prefix={<UserOutlined style={{ color: '#A8A29E' }} />}
                  placeholder="Masukkan nama tamu (misal: Budi)"
                  value={customerName === 'Guest' ? '' : customerName}
                  onChange={(e) => setCustomerName(e.target.value || 'Guest')}
                  style={{ height: '42px', borderRadius: '4px' }}
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <Space.Compact style={{ width: '100%' }}>
                    <Input
                      ref={phoneInputRef}
                      prefix={<PhoneOutlined style={{ color: '#A8A29E' }} />}
                      placeholder="Masukkan nomor HP member (misal: 0812...)"
                      value={phoneSearch}
                      onChange={(e) => setPhoneSearch(e.target.value)}
                      onPressEnter={handleSearchMember}
                      style={{ height: '42px', borderTopLeftRadius: '4px', borderBottomLeftRadius: '4px' }}
                    />
                    <Button
                      type="primary"
                      onClick={handleSearchMember}
                      loading={searchingMember}
                      style={{ height: '42px', backgroundColor: '#C2410C', borderColor: '#C2410C' }}
                    >
                      Cari
                    </Button>
                  </Space.Compact>

                   {searchedMemberResult && (
                    <div style={{
                      backgroundColor: '#DCFCE7',
                      border: '1px solid #BBF7D0',
                      borderRadius: '4px',
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      <CheckCircleOutlined style={{ color: '#166534', fontSize: '18px' }} />
                      <Text strong style={{ color: '#166534', fontSize: '14px' }}>
                        {searchedMemberResult.name}
                      </Text>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Calculations & Checkout */}
            <div style={{ backgroundColor: '#FFFBF5', padding: '16px', border: '1px solid #E7E5E4', borderRadius: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <Text style={{ fontSize: '15px' }}>Total Tagihan</Text>
                <Text strong style={{ fontSize: '20px', color: '#C2410C' }}>{formatter.format(totalAmount)}</Text>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <Text style={{ fontSize: '14px' }}>Uang Diterima</Text>
                <InputNumber
                  style={{ width: '160px', height: '42px', display: 'flex', alignItems: 'center' }}
                  min={0}
                  value={cashReceived}
                  onChange={(val) => setCashReceived(val || 0)}
                  formatter={(value) => `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value!.replace(/Rp\s?|(,*)/g, '') as any}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <Text style={{ fontSize: '14px' }}>Kembalian</Text>
                <Text strong style={{ fontSize: '16px', color: changeAmount > 0 ? '#166534' : '#1C1917' }}>
                  {formatter.format(changeAmount)}
                </Text>
              </div>

              <Button
                type="primary"
                block
                size="large"
                loading={checkoutLoading}
                onClick={handleCheckout}
                disabled={cart.items.length === 0 || cashReceived < totalAmount}
                style={{
                  backgroundColor: (cart.items.length === 0 || cashReceived < totalAmount) ? '#E7E5E4' : '#C2410C',
                  borderColor: (cart.items.length === 0 || cashReceived < totalAmount) ? '#D6D3D1' : '#C2410C',
                  color: (cart.items.length === 0 || cashReceived < totalAmount) ? '#A8A29E' : '#FFFFFF',
                  height: '50px',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  cursor: (cart.items.length === 0 || cashReceived < totalAmount) ? 'not-allowed' : 'pointer'
                }}
              >
                Proses Transaksi
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Printable Receipt Modal */}
      <Modal
        title={<span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700 }}>Struk Transaksi</span>}
        open={receiptModalOpen}
        onCancel={resetSalesView}
        footer={[
          <Button key="close" onClick={resetSalesView}>
            Transaksi Baru
          </Button>,
          <Button
            key="print"
            type="primary"
            icon={<PrinterOutlined />}
            onClick={() => {
              const iframe = document.getElementById('receipt-iframe') as HTMLIFrameElement;
              if (iframe) {
                iframe.contentWindow?.print();
              }
            }}
            style={{ backgroundColor: '#C2410C', borderColor: '#C2410C' }}
          >
            Cetak Struk
          </Button>,
        ]}
        width={400}
        destroyOnClose
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '12px' }}>
          {createdTransactionId && (
            <iframe
              id="receipt-iframe"
              src={`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/transactions/${createdTransactionId}/receipt`}
              style={{
                width: '300px',
                height: '450px',
                border: '1px solid #D6D3D1',
                borderRadius: '4px',
                backgroundColor: '#FFFFFF',
              }}
            />
          )}
        </div>
      </Modal>
    </div>
  );
};
