import React from 'react';
import { Card, Typography, List } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { useCustomerCartStore } from '../../stores/customer-cart.store';
import { formatCurrency, formatOrderStatus, formatPaymentMethod } from '../../libs/format.lib';
import type { CheckoutResult } from './customer-checkout.types';

const { Title, Text, Paragraph } = Typography;

interface CheckoutSuccessStepProps {
  createdTx: CheckoutResult;
  storeQris: string | null;
}

const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

export const CheckoutSuccessStep: React.FC<CheckoutSuccessStepProps> = ({ createdTx, storeQris }) => {
  const cart = useCustomerCartStore();

  if (!createdTx) return null;

  return (
    <div className="success-page-wrapper">
      <Card>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <CheckCircleOutlined className="success-icon" />
          <Title level={2} className="headline-text" style={{ color: '#1C1917', margin: '0 0 8px 0' }}>
            Pesanan Berhasil
          </Title>
          <div style={{ color: '#57534E', fontSize: '14px', lineHeight: '1.6' }}>
            <div>No. {createdTx.transactionCode || createdTx.code}</div>
            <div>Tanggal {formatDate(createdTx.transactionDate || createdTx.createdAt)}</div>
          </div>
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
                <div key={item.id} style={{ padding: '8px 0', borderBottom: '1px dashed #E7E5E4', fontSize: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <Text style={{ color: '#1C1917', fontWeight: 500 }}>{name}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#78716C' }}>
                    <span>{formatCurrency(price)} x {quantity}</span>
                    <Text strong style={{ color: '#1C1917' }}>
                      {formatCurrency(price * quantity)}
                    </Text>
                  </div>
                </div>
              );
            }}
          />
          {/* Grand Total */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '2px solid #E7E5E4' }}>
            <Text strong style={{ fontSize: '16px', color: '#1C1917' }}>Grand Total</Text>
            <Text strong style={{ fontSize: '18px', color: '#C2410C' }}>
              {formatCurrency(Number(createdTx.totalAmount))}
            </Text>
          </div>
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
            <Text style={{ color: '#57534E' }}>Status Pesanan:</Text>
            <Text strong style={{ color: 'var(--color-primary)' }}>
              {formatOrderStatus(createdTx.orderStatus || 'PENDING').toLowerCase()}
            </Text>
          </div>
          <div className="review-info-row">
            <Text style={{ color: '#57534E' }}>Status Pembayaran:</Text>
            <Text strong style={{ color: '#1C1917' }}>
              {createdTx.paymentStatus === 'PAID' ? 'Lunas' : 'Menunggu Pembayaran'}
            </Text>
          </div>
          <div className="review-info-row">
            <Text style={{ color: '#57534E' }}>Metode Pembayaran:</Text>
            <Text strong style={{ color: '#1C1917' }}>
              {createdTx.paymentStatus === 'PAID'
                ? `Bayar di Kasir (${createdTx.paymentMethod === 'CASH' ? 'Tunai' : formatPaymentMethod(createdTx.paymentMethod || 'CASH')})`
                : 'Bayar di Kasir'
              }
            </Text>
          </div>
        </div>

        {/* QRIS Status */}
        {createdTx.paymentMethod === 'QRIS' && createdTx.paymentStatus !== 'PAID' && (
          <div className="qris-section" style={{ margin: '24px 0', textAlign: 'center' }}>
            <Text strong style={{ display: 'block', marginBottom: '12px', color: '#1C1917', fontSize: '14px' }}>
              Silakan Pindai QRIS Toko untuk Membayar
            </Text>
            {storeQris ? (
              <img src={storeQris} alt="QRIS Toko" className="qris-image" style={{ maxWidth: '240px', margin: '0 auto 12px auto', display: 'block', border: '1px solid #E7E5E4', padding: '8px', borderRadius: '4px' }} />
            ) : (
              <div style={{ padding: '16px', background: '#F5F5F4', color: '#78716C', borderRadius: '6px', marginBottom: '12px' }}>
                <p style={{ margin: 0, fontSize: '13px' }}>QRIS Toko belum dikonfigurasi.</p>
              </div>
            )}
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
