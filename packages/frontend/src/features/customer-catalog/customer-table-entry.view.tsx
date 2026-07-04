import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spin, Result, Button, message } from 'antd';
import { useCustomerCartStore } from '../../stores/customer-cart.store';
import { useCustomerCatalogPresenter } from './customer-catalog.presenter';

export const TableEntryView: React.FC = () => {
  const { tableId } = useParams<{ tableId: string }>();
  const navigate = useNavigate();
  const setTable = useCustomerCartStore((state) => state.setTable);
  const presenter = useCustomerCatalogPresenter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tableId) {
      setError('ID Meja tidak ditemukan di URL');
      setLoading(false);
      return;
    }

    presenter.fetchTableById(tableId).then((data) => {
      if (data) {
        setTable(data.id, data.number, data.code);
        navigate('/customer/catalog', { replace: true });
      } else {
        setError('Meja tidak valid atau sudah tidak aktif');
        setLoading(false);
      }
    }).catch((err: unknown) => {
      const msg = err instanceof Error ? err.message : 'QR Code Meja tidak valid, kadaluwarsa, atau meja sedang dinonaktifkan.';
      message.error(msg);
      setError(msg);
      setLoading(false);
    });
  }, [tableId, navigate, setTable, presenter.fetchTableById]);

  if (loading) {
    return (
      <div className="customer-flex-center">
        <Spin size="large" style={{ color: 'var(--color-primary)' }} />
        <h3>Menghubungkan ke Meja...</h3>
        <p>Mohon tunggu sebentar, sistem sedang memverifikasi lokasi meja Anda.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="customer-flex-center" style={{ padding: '0 20px' }}>
        <Result
          status="error"
          title="Verifikasi Meja Gagal"
          subTitle={error}
          extra={[
            <Button
              type="primary"
              key="catalog"
              onClick={() => navigate('/customer/catalog', { replace: true })}
              className="btn-primary-terracotta"
              style={{ height: '40px' }}
            >
              Lihat Katalog Tanpa Meja
            </Button>,
          ]}
          style={{ maxWidth: '480px', background: 'var(--color-surface)', border: 'var(--border-subtle)', borderRadius: '8px', padding: '40px 24px' }}
        />
      </div>
    );
  }

  return null;
};
