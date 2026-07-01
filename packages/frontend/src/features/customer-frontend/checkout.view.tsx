import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, List, Form, Input, Alert } from 'antd';
import {
  ShoppingCartOutlined,
  DeleteOutlined,
  PlusOutlined,
  MinusOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  UserOutlined,
  PhoneOutlined,
  GiftOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useCustomerCartStore } from '../../stores/customer-cart.store';
import { useCustomerPresenter } from './customer.presenter';
import { CustomerService } from './customer.service';

const { Title, Text, Paragraph } = Typography;

export const CheckoutView: React.FC = () => {
  const navigate = useNavigate();
  const cart = useCustomerCartStore();
  const presenter = useCustomerPresenter();

  const [form] = Form.useForm();
  const [checkoutStep, setCheckoutStep] = useState<'checkout' | 'review' | 'success'>('checkout');
  const [createdTx, setCreatedTx] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [buyerName, setBuyerName] = useState<string>('');
  const [customerType] = useState<'guest'>('guest');
  const [storeName, setStoreName] = useState<string>('Toko');
  const [storeAddress, setStoreAddress] = useState<string>('');
  const [storeLogo, setStoreLogo] = useState<string | null>(null);

  const hasInvalidStock = cart.items.some(
    (item) => item.product.stock === 0 || item.quantity > item.product.stock
  );

  const refreshCartStock = async () => {
    if (cart.items.length === 0) return;
    try {
      const updatedItems = await Promise.all(
        cart.items.map(async (item) => {
          try {
            const res = await CustomerService.getPublicProductById(item.product.id);
            if (res.success && res.data) {
              return {
                ...item,
                product: {
                  ...item.product,
                  stock: res.data.stock,
                },
              };
            }
          } catch (e) {
            console.error('Error fetching product stock:', e);
          }
          return item;
        })
      );
      useCustomerCartStore.setState({ items: updatedItems });
    } catch (err) {
      console.error('Error refreshing cart stock:', err);
    }
  };

  useEffect(() => {
    refreshCartStock();
    CustomerService.getPublicStoreInfo()
      .then((res) => {
        if (res?.data?.storeName) setStoreName(res.data.storeName);
        if (res?.data?.address) setStoreAddress(res.data.address);
        if (res?.data?.logoUrl) setStoreLogo(res.data.logoUrl);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setErrorMessage(null);
    if (checkoutStep === 'checkout') {
      refreshCartStock();
    }
  }, [checkoutStep]);

  const formatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  });

  const handleQuantityChange = (productId: string, quantity: number) => {
    try {
      cart.updateQuantity(productId, quantity);
    } catch (err: any) {
      // Handled silently
    }
  };

  const handleProcessCheckout = async (buyerName: string, customerType: 'guest' | 'member_register', memberData?: any) => {
    setErrorMessage(null);
    const payload: any = {
      customerType,
      items: cart.items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
    };

    if (customerType === 'guest') {
      payload.guestName = buyerName;
    } else {
      payload.memberData = memberData;
    }

    if (cart.tableId) {
      payload.tableId = cart.tableId;
    }

    try {
      const tx = await presenter.checkout(payload);
      if (tx) {
        setCreatedTx(tx);
        cart.clearCart();
        setCheckoutStep('success');
      }
    } catch (err: any) {
      const rawMsg = err?.response?.data?.message || err?.message || '';
      let msg = 'Gagal memproses transaksi. Silakan coba beberapa saat lagi.';
      if (rawMsg.toLowerCase().includes('stock') || rawMsg.toLowerCase().includes('stok') || rawMsg.toLowerCase().includes('insufficient')) {
        msg = 'Ups! Maaf, pesanan kamu ada yang sudah kehabisan stok. Cek lagi yuk!';
      } else if (rawMsg) {
        msg = rawMsg;
      }
      setErrorMessage(msg);
      refreshCartStock();
    }
  };



  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 16px 96px 16px' }}>
      <Button
        type="text"
        icon={<ArrowLeftOutlined style={{ fontSize: '18px', color: '#1C1917' }} />}
        onClick={() => {
          if (checkoutStep === 'checkout' || checkoutStep === 'success') {
            navigate('/customer/catalog');
          } else if (checkoutStep === 'review') {
            setCheckoutStep('checkout');
          }
        }}
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

      {errorMessage && (
        <Alert
          message={errorMessage}
          type="error"
          showIcon
          closable
          onClose={() => setErrorMessage(null)}
          style={{
            maxWidth: checkoutStep === 'checkout' ? '600px' : '420px',
            margin: '0 auto 20px auto',
            borderRadius: '4px',
          }}
        />
      )}

      {checkoutStep === 'review' && (
        <Title level={2} style={{ fontFamily: 'var(--font-headline)', color: '#1C1917', marginBottom: '24px' }}>
          Review Pesanan
        </Title>
      )}

      {checkoutStep === 'checkout' && (
        cart.items.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: '48px', borderColor: '#E7E5E4', borderRadius: '12px' }} styles={{ body: { padding: '48px' } }}>
            <ShoppingCartOutlined style={{ fontSize: '64px', color: '#D4A373', marginBottom: '16px' }} />
            <Title level={4} style={{ fontFamily: 'var(--font-headline)', color: '#1C1917', margin: '0 0 8px 0' }}>
              Keranjang Anda Kosong
            </Title>
            <Paragraph style={{ color: '#8C8A87', marginBottom: '24px' }}>
              Silakan pilih kerajinan tangan berkualitas dari katalog kami terlebih dahulu.
            </Paragraph>
            <Button
              type="primary"
              onClick={() => navigate('/customer/catalog')}
              style={{ backgroundColor: '#C2410C', borderColor: '#C2410C', borderRadius: '4px', height: '42px' }}
            >
              Lihat Produk
            </Button>
          </Card>
        ) : (
          <Form
            form={form}
            layout="vertical"
            requiredMark={false}
            initialValues={{ guestName: buyerName }}
            onFinish={(values) => {
              setBuyerName(values.guestName);
              setCheckoutStep('review');
            }}
            style={{ maxWidth: '600px', margin: '0 auto' }}
          >
            <Card
              style={{ borderColor: '#E7E5E4', borderRadius: '12px' }}
              styles={{ body: { padding: '24px' } }}
            >
              <Text strong style={{ display: 'block', marginBottom: '12px', color: '#1C1917', fontSize: '14px' }}>
                Daftar Keranjang
              </Text>
              <List
                dataSource={cart.items}
                renderItem={(item) => (
                  <List.Item style={{ padding: '12px 0', borderBottom: '1px solid #E7E5E4' }}>
                    <div style={{ display: 'flex', width: '100%', gap: '12px', alignItems: 'center' }}>
                      <div style={{ width: '50px', height: '50px', borderRadius: '4px', border: '1px solid #E7E5E4', overflow: 'hidden', flexShrink: 0 }}>
                        {item.product.imageUrl ? (
                          <img src={item.product.imageUrl} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <ShoppingCartOutlined style={{ fontSize: '24px', color: '#D4A373', margin: '13px' }} />
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Text strong style={{ fontSize: '14px', color: '#1C1917', display: 'block' }} ellipsis>
                          {item.product.name}
                        </Text>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <Text style={{ fontSize: '13px', color: '#C2410C', fontWeight: 'bold' }}>
                            {formatter.format(Number(item.product.price))}
                          </Text>
                          {item.product.stock === 0 ? (
                            <span style={{ color: '#DC2626', fontSize: '11px', fontWeight: 600 }}>
                              Stok Habis
                            </span>
                          ) : item.quantity > item.product.stock ? (
                            <span style={{ color: '#DC2626', fontSize: '11px', fontWeight: 600 }}>
                              Stok tidak mencukupi (Tersedia: {item.product.stock} pcs)
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {item.product.stock === 0 ? (
                          <span style={{ color: '#DC2626', fontWeight: 600, fontSize: '12px', marginRight: '8px' }}>
                            Habis
                          </span>
                        ) : (
                          <>
                            <Button
                              size="small"
                              shape="circle"
                              icon={<MinusOutlined />}
                              onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                            />
                            <Text strong style={{ minWidth: '14px', textAlign: 'center', color: item.quantity > item.product.stock ? '#DC2626' : '#1C1917' }}>
                              {item.quantity}
                            </Text>
                            <Button
                              size="small"
                              shape="circle"
                              icon={<PlusOutlined />}
                              disabled={item.quantity >= item.product.stock}
                              onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                            />
                          </>
                        )}
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => cart.removeItem(item.product.id)}
                          style={{ marginLeft: '4px' }}
                        />
                      </div>
                    </div>
                  </List.Item>
                )}
              />

              {/* Data Pelanggan Section */}
              <div style={{ marginTop: '24px', paddingTop: '16px' }}>
                <Text strong style={{ display: 'block', marginBottom: '12px', color: '#1C1917', fontSize: '14px' }}>
                  Data Pelanggan
                </Text>

                {/* Nomor Meja — Teks Biasa dengan Label Standar Form */}
                <Form.Item label="Nomor Meja" style={{ marginBottom: '16px' }}>
                  <Text style={{
                    fontSize: '15px',
                    color: cart.tableCode ? '#C2410C' : '#8C8A87',
                  }}>
                    {cart.tableCode ? cart.tableCode : 'Tanpa Meja'}
                  </Text>
                </Form.Item>

                <Form.Item
                  label="Nama Pelanggan"
                  name="guestName"
                  rules={[{ required: true, message: 'Masukkan nama Anda!' }]}
                >
                  <Input prefix={<UserOutlined style={{ color: '#A8A29E' }} />} placeholder="Nama lengkap Anda" style={{ borderRadius: '4px' }} />
                </Form.Item>

                <Form.Item
                  label={
                    <span>
                      No. Telepon
                      <span style={{ color: '#A8A29E', fontWeight: 400, marginLeft: '4px', fontSize: '12px' }}>(Opsional)</span>
                    </span>
                  }
                  name="phone"
                >
                  <Input
                    prefix={<PhoneOutlined style={{ color: '#A8A29E' }} />}
                    placeholder="08xxxxxxxxxx"
                    style={{ borderRadius: '4px' }}
                  />
                </Form.Item>

                {/* Info promo */}
                <div style={{
                  display: 'flex',
                  gap: '10px',
                  background: '#FFFBF5',
                  border: '1px solid #D4A373',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  marginBottom: '16px',
                }}>
                  <GiftOutlined style={{ color: '#D4A373', fontSize: '16px', marginTop: '2px', flexShrink: 0 }} />
                  <Text style={{ fontSize: '12px', color: '#57534E', lineHeight: '1.6' }}>
                    Daftarkan nomor telepon kamu untuk mendapatkan info promo spesial, diskon member, dan notifikasi pesanan langsung ke WhatsApp kamu!
                  </Text>
                </div>
              </div>

              {/* Payment Method Info Section */}
              <div style={{ marginTop: '24px', borderTop: '1px solid #E7E5E4', paddingTop: '16px' }}>
                <Text strong style={{ display: 'block', marginBottom: '12px', color: '#1C1917', fontSize: '14px' }}>
                  Metode Pembayaran
                </Text>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* Pay at Cashier Option (Enabled & Active) */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      borderRadius: '6px',
                      border: '1.5px solid #C2410C',
                      background: '#FFFBF5',
                      cursor: 'pointer',
                    }}
                  >
                    <div
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        border: '1.5px solid #C2410C',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#C2410C' }} />
                    </div>
                    <div>
                      <Text strong style={{ display: 'block', fontSize: '14px', color: '#1C1917' }}>
                        Bayar di Kasir
                      </Text>
                    </div>
                  </div>

                  {/* QR Code / QRIS Option (Disabled) */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      borderRadius: '6px',
                      border: '1.5px solid #E7E5E4',
                      background: '#F5F5F4',
                      opacity: 0.5,
                      cursor: 'not-allowed',
                    }}
                  >
                    <div
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        border: '1.5px solid #D6D3D1',
                      }}
                    />
                    <div>
                      <Text strong style={{ display: 'block', fontSize: '14px', color: '#A8A29E' }}>
                        QRIS / QR Code (Segera Hadir)
                      </Text>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {cart.items.length > 0 && (
              <div
                style={{
                  position: 'fixed',
                  bottom: '16px',
                  left: '16px',
                  right: '16px',
                  maxWidth: '568px',
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
                    Total Pembayaran
                  </Text>
                  <Text style={{ fontSize: '18px', fontWeight: 'bold', color: '#FFFFFF' }}>
                    {formatter.format(cart.getTotalAmount())}
                  </Text>
                </div>
                <Button
                  type="default"
                  htmlType="submit"
                  loading={presenter.loading}
                  disabled={hasInvalidStock}
                  style={{
                    backgroundColor: hasInvalidStock ? '#E7E5E4' : '#FFFFFF',
                    color: hasInvalidStock ? '#A8A29E' : '#C2410C',
                    borderColor: hasInvalidStock ? '#E7E5E4' : '#FFFFFF',
                    fontWeight: 'bold',
                    borderRadius: '4px',
                    height: '38px',
                    cursor: hasInvalidStock ? 'not-allowed' : 'pointer',
                  }}
                >
                  Lanjut
                </Button>
              </div>
            )}
          </Form>
        )
      )}



      {checkoutStep === 'review' && (
        <div style={{ maxWidth: '420px', margin: '0 auto', paddingBottom: '80px' }}>
          <Card
            style={{ borderColor: '#E7E5E4', borderRadius: '12px' }}
            styles={{ body: { padding: '24px' } }}
          >

            {/* Rincian Produk */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', borderBottom: '1px solid #E7E5E4', paddingBottom: '8px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#FFFBF5', border: '1.5px solid #D4A373', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                  {storeLogo ? (
                    <img src={storeLogo} alt={storeName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '16px' }}>🏪</span>
                  )}
                </div>
                <div style={{ minWidth: 0 }}>
                  <Text strong style={{ display: 'block', color: '#1C1917', fontSize: '14px' }}>
                    {storeName}
                  </Text>
                  {storeAddress && (
                    <Text style={{ fontSize: '12px', color: '#57534E' }}>{storeAddress}</Text>
                  )}
                </div>
              </div>
              <div>
                {cart.items.map((item) => (
                  <div key={item.product.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px', borderBottom: '1px solid #F5F5F4' }}>
                    <div style={{ minWidth: 0, flex: 1, paddingRight: '8px' }}>
                      <Text style={{ color: '#1C1917', display: 'block' }} ellipsis>{item.product.name}</Text>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {formatter.format(Number(item.product.price))} × {item.quantity}
                      </Text>
                    </div>
                    <Text strong style={{ color: '#1C1917', flexShrink: 0, alignSelf: 'center' }}>
                      {formatter.format(Number(item.product.price) * item.quantity)}
                    </Text>
                  </div>
                ))}
              </div>
            </div>

            {/* Info Pelanggan & Pembayaran */}
            <div style={{ borderTop: '1px solid #E7E5E4', paddingTop: '12px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                <Text style={{ color: '#57534E' }}>Pelanggan:</Text>
                <Text strong style={{ color: '#1C1917' }}>{buyerName}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                <Text style={{ color: '#57534E' }}>Meja:</Text>
                <Text strong style={{ color: cart.tableCode ? '#C2410C' : '#1C1917' }}>
                  {cart.tableCode ? cart.tableCode : 'Tanpa Meja'}
                </Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                <Text style={{ color: '#57534E' }}>Tipe:</Text>
                <Text strong style={{ color: '#1C1917' }}>Tamu</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                <Text style={{ color: '#57534E' }}>Pembayaran:</Text>
                <span style={{ background: '#DCFCE7', color: '#166534', padding: '1px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 600 }}>
                  Bayar di Kasir
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E7E5E4', paddingTop: '10px', marginTop: '10px' }}>
                <Text strong style={{ color: '#1C1917', fontSize: '14px' }}>Total Pembayaran:</Text>
                <Text strong style={{ color: '#C2410C', fontSize: '16px' }}>
                  {formatter.format(cart.getTotalAmount())}
                </Text>
              </div>
            </div>

          </Card>

          {/* Floating Bottom Bar - sama persis dengan halaman keranjang */}
          <div style={{
            position: 'fixed',
            bottom: '16px',
            left: '16px',
            right: '16px',
            maxWidth: '388px',
            margin: '0 auto',
            backgroundColor: '#C2410C',
            borderRadius: '8px',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 999,
            boxShadow: '0 8px 24px rgba(28, 25, 23, 0.15)',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Text style={{ fontSize: '12px', color: '#FFFBF5', opacity: 0.9 }}>
                Total Pembayaran
              </Text>
              <Text style={{ fontSize: '18px', fontWeight: 'bold', color: '#FFFFFF' }}>
                {formatter.format(cart.getTotalAmount())}
              </Text>
            </div>
            <Button
              type="default"
              loading={presenter.loading}
              onClick={() => handleProcessCheckout(buyerName, customerType, null)}
              style={{
                backgroundColor: '#FFFFFF',
                color: '#C2410C',
                borderColor: '#FFFFFF',
                fontWeight: 'bold',
                borderRadius: '4px',
                height: '38px',
              }}
            >
              Pesan Sekarang
            </Button>
          </div>
        </div>
      )}

      {checkoutStep === 'success' && createdTx && (
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <Card
            style={{
              borderColor: '#E7E5E4',
              borderRadius: '12px',
              background: '#FFFFFF',
            }}
            styles={{ body: { padding: '32px' } }}
          >
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <CheckCircleOutlined style={{ fontSize: '56px', color: '#365314', marginBottom: '12px' }} />
              <Title level={2} style={{ fontFamily: 'var(--font-headline)', color: '#1C1917', margin: '0 0 4px 0' }}>
                Pesanan Berhasil
              </Title>
              <Text type="secondary">Kode Transaksi: {createdTx.transactionCode || createdTx.code}</Text>
            </div>

            {/* Rincian Produk */}
            <div style={{ marginBottom: '24px' }}>
              <Text strong style={{ display: 'block', marginBottom: '12px', color: '#1C1917', fontSize: '15px', borderBottom: '1px solid #E7E5E4', paddingBottom: '6px' }}>
                Rincian Produk
              </Text>
              <List
                dataSource={createdTx.items || []}
                renderItem={(item: any) => {
                  const name = item.product?.name || item.name || 'Produk';
                  const quantity = item.quantity || 1;
                  const price = Number(item.priceAtPurchase || item.product?.price || 0);

                  return (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '14px' }}>
                      <div>
                        <Text style={{ color: '#1C1917' }}>{name}</Text>
                        <Text type="secondary" style={{ marginLeft: '8px' }}>x{quantity}</Text>
                      </div>
                      <Text strong style={{ color: '#1C1917' }}>
                        {formatter.format(price * quantity)}
                      </Text>
                    </div>
                  );
                }}
              />
            </div>

            {/* Info Pembayaran & Total */}
            <div
              style={{
                borderTop: '1px solid #E7E5E4',
                paddingTop: '16px',
                marginBottom: '24px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                <Text style={{ color: '#57534E' }}>Pelanggan:</Text>
                <Text strong style={{ color: '#1C1917' }}>
                  {createdTx.customerName || 'Tamu'}
                </Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                <Text style={{ color: '#57534E' }}>Meja:</Text>
                <Text strong style={{ color: cart.tableCode ? '#C2410C' : '#1C1917' }}>
                  {cart.tableCode ? cart.tableCode : 'Tanpa Meja'}
                </Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                <Text style={{ color: '#57534E' }}>Metode Pembayaran:</Text>
                <span style={{ background: '#DCFCE7', color: '#166534', padding: '1px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                  Bayar di Kasir
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E7E5E4', paddingTop: '12px', marginTop: '12px' }}>
                <Text strong style={{ color: '#1C1917', fontSize: '15px' }}>Total Pembayaran:</Text>
                <Text strong style={{ color: '#C2410C', fontSize: '18px' }}>
                  {formatter.format(Number(createdTx.totalAmount))}
                </Text>
              </div>
            </div>

            {/* Ucapan Terimakasih */}
            <div style={{ textAlign: 'center' }}>
              <Paragraph style={{ fontFamily: 'var(--font-headline)', fontStyle: 'italic', fontSize: '16px', color: '#365314', margin: 0 }}>
                "Terima kasih telah berbelanja dan mendukung produk lokal UMKM!"
              </Paragraph>
            </div>
          </Card>
        </div>
      )}


    </div>
  );
};

export default CheckoutView;
