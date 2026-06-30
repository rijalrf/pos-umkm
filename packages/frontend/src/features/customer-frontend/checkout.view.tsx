import React, { useState } from 'react';
import { Card, Col, Row, Button, Typography, Radio, Form, Input, List } from 'antd';
import { ShoppingCartOutlined, DeleteOutlined, PlusOutlined, MinusOutlined, CheckCircleOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useCustomerCartStore } from '../../stores/customer-cart.store';
import { useCustomerPresenter } from './customer.presenter';

const { Title, Text, Paragraph } = Typography;

export const CheckoutView: React.FC = () => {
  const navigate = useNavigate();
  const cart = useCustomerCartStore();
  const presenter = useCustomerPresenter();

  const [checkoutStep, setCheckoutStep] = useState<'checkout' | 'success'>('checkout');
  const [customerType, setCustomerType] = useState<'guest' | 'member_register'>('guest');
  const [createdTx, setCreatedTx] = useState<any>(null);

  const formatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  });

  const handleQuantityChange = (productId: string, quantity: number) => {
    try {
      cart.updateQuantity(productId, quantity);
    } catch (err: any) {
      // Handled silently or custom warning
    }
  };

  const onFinishCheckout = async (values: any) => {
    const payload: any = {
      customerType,
      items: cart.items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
    };

    if (customerType === 'guest') {
      payload.guestName = values.guestName;
    } else {
      payload.memberData = {
        name: values.memberName,
        email: values.memberEmail,
        password: values.memberPassword,
        phone: values.memberPhone,
        address: values.memberAddress,
      };
    }

    const tx = await presenter.checkout(payload);
    if (tx) {
      setCreatedTx(tx.transaction);
      cart.clearCart();
      setCheckoutStep('success');
    }
  };

  if (checkoutStep === 'success' && createdTx) {
    return (
      <div style={{ maxWidth: '600px', margin: '40px auto', padding: '0 16px' }}>
        <Card
          style={{
            textAlign: 'center',
            borderColor: '#E7E5E4',
            borderRadius: '12px',
            background: '#FFFFFF',
            padding: '24px',
          }}
        >
          <CheckCircleOutlined style={{ fontSize: '64px', color: '#365314', marginBottom: '16px' }} />
          <Title level={2} style={{ fontFamily: "'Playfair Display', serif", color: '#1C1917', margin: '0 0 8px 0' }}>
            Pesanan Berhasil
          </Title>
          <Text style={{ display: 'block', color: '#57534E', marginBottom: '24px' }}>
            Terima kasih telah berbelanja dan mendukung produk lokal UMKM!
          </Text>

          <div
            style={{
              background: '#FFFBF5',
              border: '1.5px solid #D6D3D1',
              borderRadius: '8px',
              padding: '16px',
              textAlign: 'left',
              marginBottom: '32px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <Text style={{ color: '#57534E' }}>Kode Transaksi:</Text>
              <code style={{ fontFamily: "'Source Code Pro', monospace", fontWeight: 'bold', color: '#1C1917' }}>
                {createdTx.code}
              </code>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <Text style={{ color: '#57534E' }}>Pembeli:</Text>
              <Text strong style={{ color: '#1C1917' }}>
                {createdTx.customerName || 'Tamu'}
              </Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E7E5E4', paddingTop: '8px', marginTop: '8px' }}>
              <Text strong style={{ color: '#1C1917' }}>Total Pembayaran:</Text>
              <Text strong style={{ color: '#C2410C' }}>
                {formatter.format(Number(createdTx.totalAmount))}
              </Text>
            </div>
          </div>

          <Button
            type="primary"
            size="large"
            onClick={() => navigate('/customer/catalog')}
            style={{
              backgroundColor: '#C2410C',
              borderColor: '#C2410C',
              fontWeight: 'bold',
              height: '46px',
              borderRadius: '4px',
              width: '100%',
            }}
          >
            Kembali ke Katalog
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 16px' }}>
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/customer/catalog')}
        style={{ color: '#57534E', padding: 0, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
      >
        Kembali Belanja
      </Button>

      <Title level={2} style={{ fontFamily: "'Playfair Display', serif", color: '#1C1917', marginBottom: '24px' }}>
        Keranjang & Checkout
      </Title>

      {cart.items.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '48px', borderColor: '#E7E5E4', borderRadius: '12px' }}>
          <ShoppingCartOutlined style={{ fontSize: '64px', color: '#D4A373', marginBottom: '16px' }} />
          <Title level={4} style={{ fontFamily: "'Playfair Display', serif", color: '#1C1917', margin: '0 0 8px 0' }}>
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
        <Row gutter={[32, 32]}>
          {/* Left Column: Cart Items */}
          <Col xs={24} md={12}>
            <Card
              title={<span style={{ fontFamily: "'Playfair Display', serif", color: '#1C1917', fontWeight: 700 }}>Daftar Keranjang</span>}
              style={{ borderColor: '#E7E5E4', borderRadius: '12px' }}
            >
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
                        <Text style={{ fontSize: '13px', color: '#C2410C', fontWeight: 'bold' }}>
                          {formatter.format(Number(item.product.price))}
                        </Text>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Button
                          size="small"
                          shape="circle"
                          icon={<MinusOutlined />}
                          onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                        />
                        <Text strong style={{ minWidth: '14px', textAlign: 'center' }}>{item.quantity}</Text>
                        <Button
                          size="small"
                          shape="circle"
                          icon={<PlusOutlined />}
                          disabled={item.quantity >= item.product.stock}
                          onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                        />
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

              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: '15px', color: '#57534E' }}>Subtotal:</Text>
                <Text strong style={{ fontSize: '20px', color: '#C2410C' }}>
                  {formatter.format(cart.getTotalAmount())}
                </Text>
              </div>
            </Card>
          </Col>

          {/* Right Column: Checkout Form */}
          <Col xs={24} md={12}>
            <Card
              title={<span style={{ fontFamily: "'Playfair Display', serif", color: '#1C1917', fontWeight: 700 }}>Informasi Pembeli</span>}
              style={{ borderColor: '#E7E5E4', borderRadius: '12px' }}
            >
              <div style={{ marginBottom: '20px' }}>
                <Text strong style={{ display: 'block', marginBottom: '8px', color: '#1C1917' }}>Tipe Pembelian</Text>
                <Radio.Group
                  value={customerType}
                  onChange={(e) => setCustomerType(e.target.value)}
                  optionType="button"
                  buttonStyle="solid"
                  style={{ width: '100%', display: 'flex' }}
                >
                  <Radio.Button value="guest" style={{ flex: 1, textAlign: 'center' }}>Tamu (Guest)</Radio.Button>
                  <Radio.Button value="member_register" style={{ flex: 1, textAlign: 'center' }}>Daftar Member</Radio.Button>
                </Radio.Group>
              </div>

              <Form layout="vertical" onFinish={onFinishCheckout} size="large" requiredMark={false}>
                {customerType === 'guest' ? (
                  <Form.Item
                    label="Nama Tamu"
                    name="guestName"
                    rules={[{ required: true, message: 'Masukkan nama Anda!' }]}
                  >
                    <Input placeholder="Nama lengkap Anda" style={{ borderRadius: '4px' }} />
                  </Form.Item>
                ) : (
                  <>
                    <Form.Item
                      label="Nama Lengkap"
                      name="memberName"
                      rules={[{ required: true, message: 'Nama lengkap wajib diisi!' }]}
                    >
                      <Input placeholder="Nama lengkap Anda" style={{ borderRadius: '4px' }} />
                    </Form.Item>
                    <Form.Item
                      label="Alamat Email"
                      name="memberEmail"
                      rules={[
                        { required: true, message: 'Email wajib diisi!' },
                        { type: 'email', message: 'Format email tidak valid!' },
                      ]}
                    >
                      <Input placeholder="nama@email.com" style={{ borderRadius: '4px' }} />
                    </Form.Item>
                    <Form.Item
                      label="Password Akun"
                      name="memberPassword"
                      rules={[{ required: true, message: 'Password wajib diisi!' }]}
                    >
                      <Input.Password placeholder="Password untuk login member" style={{ borderRadius: '4px' }} />
                    </Form.Item>
                    <Form.Item label="Nomor Telepon (Opsional)" name="memberPhone">
                      <Input placeholder="08xxxxxxxx" style={{ borderRadius: '4px' }} />
                    </Form.Item>
                    <Form.Item label="Alamat Lengkap (Opsional)" name="memberAddress">
                      <Input.TextArea placeholder="Alamat pengiriman / tempat tinggal" rows={3} style={{ borderRadius: '4px' }} />
                    </Form.Item>
                  </>
                )}

                <div style={{ marginTop: '24px', borderTop: '1px solid #E7E5E4', paddingTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <Text strong style={{ fontSize: '16px' }}>Total Pembayaran</Text>
                    <Text strong style={{ fontSize: '20px', color: '#C2410C' }}>
                      {formatter.format(cart.getTotalAmount())}
                    </Text>
                  </div>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={presenter.loading}
                    block
                    style={{ backgroundColor: '#C2410C', borderColor: '#C2410C', fontWeight: 'bold', height: '48px', borderRadius: '4px' }}
                  >
                    Beli Sekarang
                  </Button>
                </div>
              </Form>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default CheckoutView;
