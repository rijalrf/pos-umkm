import React from 'react';
import { Card, Button, Typography, List, Form, Input, Alert } from 'antd';
import type { FormInstance } from 'antd/es/form';
import {
  ShoppingCartOutlined,
  DeleteOutlined,
  PlusOutlined,
  MinusOutlined,
  UserOutlined,
  PhoneOutlined,
  GiftOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useCustomerCartStore } from '../../stores/customer-cart.store';
import { formatCurrency } from '../../libs/format.lib';

const { Text } = Typography;

interface CheckoutCartStepProps {
  loading: boolean;
  errorMessage: string | null;
  hasInvalidStock: boolean;
  paymentMethod: string;
  setPaymentMethod: (method: 'CASH' | 'QRIS') => void;
  form: FormInstance;
  onFinish: (values: { guestName: string; phone?: string }) => void;
  onQuantityChange: (productId: string, quantity: number) => void;
}

export const CheckoutCartStep: React.FC<CheckoutCartStepProps> = ({
  loading,
  errorMessage,
  hasInvalidStock,
  paymentMethod,
  setPaymentMethod,
  form,
  onFinish,
  onQuantityChange,
}) => {
  const navigate = useNavigate();
  const cart = useCustomerCartStore();

  if (cart.items.length === 0) {
    return (
      <Card style={{ textAlign: 'center', padding: '48px' }}>
        <ShoppingCartOutlined style={{ fontSize: '64px', color: 'var(--color-secondary)', marginBottom: '16px' }} />
        <Text strong style={{ display: 'block', fontSize: '18px', color: '#1C1917', marginBottom: '8px' }}>
          Keranjang Anda Kosong
        </Text>
        <Text style={{ color: '#8C8A87', display: 'block', marginBottom: '24px' }}>
          Silakan pilih kerajinan tangan berkualitas dari katalog kami terlebih dahulu.
        </Text>
        <Button type="primary" onClick={() => navigate('/customer/catalog')} className="btn-primary-terracotta" style={{ height: '42px' }}>
          Lihat Produk
        </Button>
      </Card>
    );
  }

  return (
    <Form
      form={form}
      layout="vertical"
      requiredMark={false}
      onFinish={onFinish}
      className="form-max-600"
    >
      {errorMessage && (
        <Alert message={errorMessage} type="error" showIcon closable style={{ marginBottom: '20px', borderRadius: '4px' }} />
      )}

      <Card>
        <Text strong className="section-title">Daftar Keranjang</Text>
        <List
          dataSource={cart.items}
          renderItem={(item) => (
            <List.Item style={{ padding: '12px 0', borderBottom: 'var(--border-subtle)' }}>
              <div className="cart-item-container">
                <div className="cart-item-image">
                  {item.product.imageUrl ? (
                    <img src={item.product.imageUrl} alt={item.product.name} />
                  ) : (
                    <ShoppingCartOutlined style={{ fontSize: '24px', color: 'var(--color-secondary)', margin: '13px' }} />
                  )}
                </div>
                <div className="cart-item-details">
                  <Text className="cart-item-name" ellipsis>{item.product.name}</Text>
                  <div className="flex-column" style={{ gap: '2px' }}>
                    <Text className="cart-item-price">{formatCurrency(item.product.price)}</Text>
                    {item.product.stock === 0 ? (
                      <span style={{ color: 'var(--color-error)', fontSize: '11px', fontWeight: 600 }}>Stok Habis</span>
                    ) : item.quantity > item.product.stock ? (
                      <span style={{ color: 'var(--color-error)', fontSize: '11px', fontWeight: 600 }}>
                        Stok tidak mencukupi (Tersedia: {item.product.stock} pcs)
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="cart-item-actions">
                  {item.product.stock === 0 ? (
                    <span style={{ color: 'var(--color-error)', fontWeight: 600, fontSize: '12px', marginRight: '8px' }}>Habis</span>
                  ) : (
                    <>
                      <Button size="small" shape="circle" icon={<MinusOutlined />} onClick={() => onQuantityChange(item.product.id, item.quantity - 1)} />
                      <Text strong style={{ minWidth: '14px', textAlign: 'center', color: item.quantity > item.product.stock ? 'var(--color-error)' : '#1C1917' }}>
                        {item.quantity}
                      </Text>
                      <Button size="small" shape="circle" icon={<PlusOutlined />} disabled={item.quantity >= item.product.stock} onClick={() => onQuantityChange(item.product.id, item.quantity + 1)} />
                    </>
                  )}
                  <Button type="text" danger icon={<DeleteOutlined />} onClick={() => cart.removeItem(item.product.id)} style={{ marginLeft: '4px' }} />
                </div>
              </div>
            </List.Item>
          )}
        />

        {/* Customer Data Section */}
        <div className="checkout-customer-section">
          <Text strong className="section-title">Data Pelanggan</Text>

          <Form.Item label="Nomor Meja" style={{ marginBottom: '16px' }}>
            <Text style={{ fontSize: '15px', color: cart.tableCode ? 'var(--color-primary)' : '#8C8A87' }}>
              {cart.tableCode || 'Tanpa Meja'}
            </Text>
          </Form.Item>

          <Form.Item label="Nama Pelanggan" name="guestName" rules={[{ required: true, message: 'Masukkan nama Anda!' }]}>
            <Input prefix={<UserOutlined style={{ color: '#A8A29E' }} />} placeholder="Nama lengkap Anda" className="input-medium" />
          </Form.Item>

          <Form.Item
            label={<span>No. Telepon <span style={{ color: '#A8A29E', fontWeight: 400, marginLeft: '4px', fontSize: '12px' }}>(Opsional)</span></span>}
            name="phone"
          >
            <Input prefix={<PhoneOutlined style={{ color: '#A8A29E' }} />} placeholder="08xxxxxxxxxx" className="input-medium" />
          </Form.Item>

          <div className="promo-box">
            <GiftOutlined style={{ color: 'var(--color-secondary)', fontSize: '16px', marginTop: '2px', flexShrink: 0 }} />
            <Text className="promo-text">
              Daftarkan nomor telepon kamu untuk mendapatkan info promo spesial, diskon member, dan notifikasi pesanan langsung ke WhatsApp kamu!
            </Text>
          </div>
        </div>

        {/* Payment Method */}
        <div className="section-divider" style={{ marginTop: '24px' }}>
          <Text strong className="section-title">Metode Pembayaran</Text>
          <div className="flex-column" style={{ gap: '10px' }}>
            <div
              onClick={() => setPaymentMethod('CASH')}
              className={`payment-option${paymentMethod === 'CASH' ? ' payment-option-selected' : ' payment-option-unselected'}`}
            >
              <div className={`payment-radio-outer${paymentMethod === 'CASH' ? ' payment-radio-selected' : ' payment-radio-unselected'}`}>
                {paymentMethod === 'CASH' && <div className="payment-radio-inner" />}
              </div>
              <Text strong className="payment-option-label" style={{ color: paymentMethod === 'CASH' ? '#1C1917' : '#57534E' }}>
                Tunai
              </Text>
            </div>
            <div
              onClick={() => setPaymentMethod('QRIS')}
              className={`payment-option${paymentMethod === 'QRIS' ? ' payment-option-selected' : ' payment-option-unselected'}`}
            >
              <div className={`payment-radio-outer${paymentMethod === 'QRIS' ? ' payment-radio-selected' : ' payment-radio-unselected'}`}>
                {paymentMethod === 'QRIS' && <div className="payment-radio-inner" />}
              </div>
              <Text strong className="payment-option-label" style={{ color: paymentMethod === 'QRIS' ? '#1C1917' : '#57534E' }}>
                QRIS
              </Text>
            </div>
          </div>
        </div>
      </Card>

      {/* Floating Bottom Bar */}
      {cart.items.length > 0 && (
        <div className="floating-bottom-bar floating-bottom-bar-checkout">
          <div className="flex-column">
            <Text className="floating-total-label">Total Pembayaran</Text>
            <Text className="floating-total-amount">{formatCurrency(cart.getTotalAmount())}</Text>
          </div>
          <Button
            type="default"
            htmlType="submit"
            loading={loading}
            disabled={hasInvalidStock}
            className="floating-submit-btn"
          >
            Lanjut
          </Button>
        </div>
      )}
    </Form>
  );
};
