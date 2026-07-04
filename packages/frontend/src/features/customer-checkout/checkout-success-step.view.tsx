import React from 'react';
import { Card, Typography, List } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { useCustomerCartStore } from '../../stores/customer-cart.store';
import { formatCurrency } from '../../libs/format.lib';
import type { CheckoutResult } from './customer-checkout.types';

const { Title, Text, Paragraph } = Typography;

interface CheckoutSuccessStepProps {
  createdTx: CheckoutResult;
}

export const CheckoutSuccessStep: React.FC<CheckoutSuccessStepProps> = ({ createdTx }) => {
  const cart = useCustomerCartStore();

  if (!createdTx) return null;

  return (
    <div className="success-page-wrapper">
      <Card>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <CheckCircleOutlined className="success-icon" />
          <Title level={2} className="headline-text" style={{ color: '#1C1917', margin: '0 0 4px 0' }}>
            Pesanan Berhasil
          </Title>
          <Text type="secondary">Kode Transaksi: {createdTx.transactionCode || createdTx.code}</Text>
        </div>

        {/* Product Details */}
        <div style={{ marginBottom: '24px' }}>
          <Text strong style={{ display: 'block', marginBottom: '12px', color: '#1C1917', fontSize: '15px', borderBottom: 'var(--border-subtle)', paddingBottom: '6px' }}>
            Rincian Produk
          </Text>
          <List
            dataSource={createdTx.items || []}
            renderItem={(item: CheckoutResult['items'][number]) => {
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
                    {formatCurrency(price * quantity)}
                  </Text>
                </div>
              );
            }}
          />
        </div>

        {/* Payment Info */}
        <div className="review-section">
          <div className="review-info-row">
            <Text style={{ color: '#57534E' }}>Pelanggan:</Text>
            <Text strong style={{ color: '#1C1917' }}>{createdTx.customerName || 'Tamu'}</Text>
          </div>
          <div className="review-info-row">
            <Text style={{ color: '#57534E' }}>Meja:</Text>
            <Text strong style={{ color: cart.tableCode ? 'var(--color-primary)' : '#1C1917' }}>
              {cart.tableCode || 'Tanpa Meja'}
            </Text>
          </div>
          <div className="review-info-row">
            <Text style={{ color: '#57534E' }}>Metode Pembayaran:</Text>
            <span className="status-chip status-chip-success">
              {createdTx.paymentMethod === 'QRIS' ? 'QRIS' : 'Tunai'}
            </span>
          </div>
          <div className="review-total-row">
            <Text className="review-total-label">Total Pembayaran:</Text>
            <Text className="review-total-amount">{formatCurrency(Number(createdTx.totalAmount))}</Text>
          </div>
        </div>

        {/* QRIS Status */}
        {createdTx.paymentMethod === 'QRIS' && (
          <div className="qris-section" style={{ margin: '24px 0' }}>
            <Text strong style={{ display: 'block', marginBottom: '8px', color: 'var(--color-tertiary)', fontSize: '14px' }}>
              Pembayaran QRIS Sedang Diproses
            </Text>
            <Text style={{ fontSize: '12px', color: '#57534E', display: 'block', marginBottom: '8px' }}>
              Pesanan Anda sudah diterima oleh sistem.
            </Text>
            <Text style={{ fontSize: '11px', fontStyle: 'italic', color: '#78716C' }}>
              Mohon tunjukkan bukti transaksi sukses atau tunggu verifikasi dari kasir.
            </Text>
          </div>
        )}

        {/* Thank You */}
        <div style={{ textAlign: 'center' }}>
          <Paragraph className="headline-text" style={{ fontStyle: 'italic', fontSize: '16px', color: 'var(--color-tertiary)', margin: 0 }}>
            "Terima kasih telah berbelanja dan mendukung produk lokal UMKM!"
          </Paragraph>
        </div>
      </Card>
    </div>
  );
};
