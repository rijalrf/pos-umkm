import React, { useEffect, useState, useMemo } from 'react';
import { Row, Col, Card, Input, Button, Divider, InputNumber, Modal, message, Radio, Typography, Tag, Empty, Select } from 'antd';
import { SearchOutlined, ShoppingCartOutlined, PlusOutlined, MinusOutlined, DeleteOutlined, PrinterOutlined, UserOutlined } from '@ant-design/icons';
import { useCartStore } from '../../stores/cart.store';
import { ProductsService } from '../products/products.service';
import { CategoriesService } from '../categories/categories.service';
import { SalesService } from './sales.service';
import { ProductItem } from '../products/products.presenter';

const { Title, Text } = Typography;

export const SalesView: React.FC = () => {
  const cart = useCartStore();

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

  // Receipt Modal
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [createdTransactionId, setCreatedTransactionId] = useState<string | null>(null);

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

  // Filter products locally for instantaneous typing response
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.sku.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory ? product.categoryId === selectedCategory : true;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, selectedCategory]);

  const handleAddToCart = (product: ProductItem) => {
    try {
      cart.addItem(product);
      message.success(`Added ${product.name} to cart`);
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
      message.warning('Cart is empty');
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

  const handleQuickCash = (amount: number) => {
    setCashReceived(amount);
  };

  const resetSalesView = () => {
    cart.clearCart();
    setCashReceived(0);
    setCustomerName('Guest');
    setCustomerId(undefined);
    setCustomerType('guest');
    setCreatedTransactionId(null);
    setReceiptModalOpen(false);
  };

  return (
    <div style={{ padding: '16px', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <Row gutter={24} style={{ flex: 1, minHeight: 0 }}>
        {/* Left Side: Product Catalog */}
        <Col span={14} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Card
            style={{ display: 'flex', flexDirection: 'column', flex: 1, border: '1px solid #E7E5E4', borderRadius: '8px', minHeight: 0 }}
            bodyStyle={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '16px', minHeight: 0 }}
          >
            <div style={{ marginBottom: '16px' }}>
              <Input
                placeholder="Search by name or SKU/barcode..."
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
                All Categories
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
                <div style={{ textAlign: 'center', padding: '40px' }}>Loading catalog...</div>
              ) : filteredProducts.length === 0 ? (
                <Empty description="No products found" style={{ marginTop: '40px' }} />
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
                            <img src={product.imageUrl} alt={product.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                          ) : (
                            <ShoppingCartOutlined style={{ fontSize: '32px', color: '#D4A373' }} />
                          )}

                          {isOutOfStock && (
                            <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                              <Tag color="red">OUT OF STOCK</Tag>
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
                            <Tag color="warning" style={{ fontSize: '9px', margin: 0 }}>Stock: {product.stock}</Tag>
                          )}
                          {!isLowStock && (
                            <Text type="secondary" style={{ fontSize: '11px' }}>Stock: {product.stock}</Text>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>
        </Col>

        {/* Right Side: Cart and Checkout */}
        <Col span={10} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Card
            style={{ display: 'flex', flexDirection: 'column', flex: 1, border: '1px solid #E7E5E4', borderRadius: '8px', minHeight: 0 }}
            bodyStyle={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '16px', minHeight: 0 }}
          >
            <Title level={4} style={{ fontFamily: "'Playfair Display', serif", margin: '0 0 12px 0', display: 'flex', justifyContent: 'space-between' }}>
              <span><ShoppingCartOutlined /> Active Cart</span>
              <Button size="small" type="link" danger onClick={cart.clearCart} disabled={cart.items.length === 0}>
                Clear Cart
              </Button>
            </Title>

            {/* Cart Items List */}
            <div style={{ flex: 1, overflowY: 'auto', border: '1px solid #E7E5E4', borderRadius: '4px', padding: '8px', marginBottom: '16px', backgroundColor: '#FFFBF5' }}>
              {cart.items.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#A8A29E' }}>
                  Cart is empty. Select products on the left.
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
                <Text strong style={{ fontSize: '13px' }}>Customer Type</Text>
              </div>
              <Radio.Group value={customerType} onChange={(e) => setCustomerType(e.target.value)} style={{ marginBottom: '10px' }}>
                <Radio value="guest">Guest / Walk-in</Radio>
                <Radio value="member">Member</Radio>
              </Radio.Group>

              {customerType === 'guest' ? (
                <Input
                  prefix={<UserOutlined style={{ color: '#A8A29E' }} />}
                  placeholder="Enter Guest Name (e.g. Budi)"
                  value={customerName === 'Guest' ? '' : customerName}
                  onChange={(e) => setCustomerName(e.target.value || 'Guest')}
                  style={{ height: '42px', borderRadius: '4px' }}
                />
              ) : (
                <Select
                  showSearch
                  placeholder="Select Member Customer"
                  style={{ width: '100%', height: '42px' }}
                  onChange={(val: string) => {
                    setCustomerId(val);
                    setCustomerName('');
                  }}
                  value={customerId}
                  options={[
                    { value: 'mock-id-1', label: 'Asep (asep@example.com)' },
                    { value: 'mock-id-2', label: 'Dewi (dewi@example.com)' },
                  ]}
                />
              )}
            </div>

            {/* Calculations & Checkout */}
            <div style={{ backgroundColor: '#FFFBF5', padding: '16px', border: '1px solid #E7E5E4', borderRadius: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <Text style={{ fontSize: '15px' }}>Total Amount</Text>
                <Text strong style={{ fontSize: '20px', color: '#C2410C' }}>{formatter.format(totalAmount)}</Text>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <Text style={{ fontSize: '14px' }}>Cash Received</Text>
                <InputNumber
                  style={{ width: '160px', height: '42px', display: 'flex', alignItems: 'center' }}
                  min={0}
                  value={cashReceived}
                  onChange={(val) => setCashReceived(val || 0)}
                  formatter={(value) => `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value!.replace(/Rp\s?|(,*)/g, '') as any}
                />
              </div>

              {/* Quick Cash Buttons */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                {[totalAmount, 10000, 20000, 50000, 100000].map((amt) => {
                  if (amt < totalAmount && amt !== totalAmount) return null;
                  return (
                    <Button
                      key={amt}
                      size="small"
                      onClick={() => handleQuickCash(amt)}
                      style={{ fontSize: '11px', borderRadius: '4px' }}
                    >
                      {amt === totalAmount ? 'Exact' : formatter.format(amt)}
                    </Button>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <Text style={{ fontSize: '14px' }}>Cash Return (Kembalian)</Text>
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
                  backgroundColor: '#C2410C',
                  borderColor: '#C2410C',
                  height: '50px',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                }}
              >
                Process Transaction
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Printable Receipt Modal */}
      <Modal
        title={<span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>Transaction Receipt</span>}
        open={receiptModalOpen}
        onCancel={resetSalesView}
        footer={[
          <Button key="close" onClick={resetSalesView}>
            New Transaction
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
            Print Receipt
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
