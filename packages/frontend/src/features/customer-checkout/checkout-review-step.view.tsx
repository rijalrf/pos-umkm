import React from 'react';
import { Card, Button, Typography } from 'antd';
import { useCustomerCartStore } from '../../stores/customer-cart.store';
import { formatCurrency } from '../../libs/format.lib';
import type { StoreInfoData } from './customer-checkout.types';
import type { CustomerCartItem } from '../../stores/customer-cart.store';

const { Text } = Typography;

interface CheckoutReviewStepProps {
  loading: boolean;
  buyerName: string;
  storeInfo: StoreInfoData | null;
  paymentMethod: string;
  storeQris: string | null;
  onCheckout: () => void;
}

export const CheckoutReviewStep: React.FC<CheckoutReviewStepProps> = ({
  loading,
  buyerName,
  storeInfo,
  paymentMethod,
  storeQris,
  onCheckout,
}) => {
  const cart = useCustomerCartStore();

  return (
    <div className="customer-card-wrapper">
      <Card>
        {/* Store Header */}
        <div className="review-store-header">
          <div className="review-store-logo">
            {storeInfo?.logoUrl ? (
              <img src={storeInfo.logoUrl} alt={storeInfo.storeName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '16px' }}>🏪</span>
            )}
          </div>
          <div style={{ minWidth: 0 }}>
            <Text strong style={{ display: 'block', color: '#1C1917', fontSize: '14px' }}>
              {storeInfo?.storeName || 'Toko'}
            </Text>
            {storeInfo?.address && (
              <Text style={{ fontSize: '12px', color: '#57534E' }}>{storeInfo.address}</Text>
            )}
          </div>
        </div>

        {/* Product Items */}
        <div style={{ marginBottom: '20px' }}>
          {cart.items.map((item: CustomerCartItem) => (
            <div key={item.product.id} className="review-item-row">
              <div style={{ minWidth: 0, flex: 1, paddingRight: '8px' }}>
                <Text style={{ color: '#1C1917', display: 'block' }} ellipsis>{item.product.name}</Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {formatCurrency(item.product.price)} × {item.quantity}
                </Text>
              </div>
              <Text strong style={{ color: '#1C1917', flexShrink: 0, alignSelf: 'center' }}>
                {formatCurrency(Number(item.product.price) * item.quantity)}
              </Text>
            </div>
          ))}
        </div>

        {/* Customer & Payment Info */}
        <div className="review-section">
          <div className="review-info-row">
            <Text style={{ color: '#57534E' }}>Pelanggan:</Text>
            <Text strong style={{ color: '#1C1917' }}>{buyerName}</Text>
          </div>
          <div className="review-info-row">
            <Text style={{ color: '#57534E' }}>Meja:</Text>
            <Text strong style={{ color: cart.tableCode ? 'var(--color-primary)' : '#1C1917' }}>
              {cart.tableCode || 'Tanpa Meja'}
            </Text>
          </div>
          <div className="review-info-row">
            <Text style={{ color: '#57534E' }}>Tipe:</Text>
            <Text strong style={{ color: '#1C1917' }}>Tamu</Text>
          </div>
          <div className="review-info-row">
            <Text style={{ color: '#57534E' }}>Pembayaran:</Text>
            <span className="status-chip status-chip-success">{paymentMethod === 'QRIS' ? 'QRIS' : 'Tunai'}</span>
          </div>
          <div className="review-total-row">
            <Text className="review-total-label">Total Pembayaran:</Text>
            <Text className="review-total-amount">{formatCurrency(cart.getTotalAmount())}</Text>
          </div>
        </div>

        {/* QRIS Section */}
        {paymentMethod === 'QRIS' && (
          <div className="qris-section">
            <Text strong style={{ display: 'block', marginBottom: '12px', color: '#1C1917', fontSize: '14px' }}>
              Silakan Pindai QRIS Toko untuk Membayar
            </Text>
            {storeQris ? (
              <img src={storeQris} alt="QRIS Toko" className="qris-image" />
            ) : (
              <div style={{ padding: '16px', background: '#F5F5F4', color: '#78716C', borderRadius: '6px', marginBottom: '12px' }}>
                <p style={{ margin: 0, fontSize: '13px' }}>QRIS Toko belum dikonfigurasi.</p>
              </div>
            )}
            <Text type="secondary" style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>
              Total Tagihan: {formatCurrency(cart.getTotalAmount())}
            </Text>
            <Text style={{ fontSize: '12px', fontStyle: 'italic', color: '#57534E' }}>
              Setelah sukses melakukan transfer pembayaran, silakan ketuk tombol "Bayar Sekarang" di bawah untuk memproses pesanan.
            </Text>
          </div>
        )}
      </Card>

      {/* Floating Bottom Bar */}
      <div className="floating-bottom-bar floating-bottom-bar-review">
        <div className="flex-column">
          <Text className="floating-total-label">Total Pembayaran</Text>
          <Text className="floating-total-amount">{formatCurrency(cart.getTotalAmount())}</Text>
        </div>
        <Button
          type="default"
          loading={loading}
          onClick={onCheckout}
          className="floating-submit-btn"
          disabled={loading}
        >
          {paymentMethod === 'QRIS' ? 'Bayar Sekarang' : 'Pesan Sekarang'}
        </Button>
      </div>
    </div>
  );
};
