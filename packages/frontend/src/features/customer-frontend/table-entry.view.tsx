import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spin, Result, Button } from 'antd';
import { useCustomerCartStore } from '../../stores/customer-cart.store';
import { CustomerService } from './customer.service';

export const TableEntryView: React.FC = () => {
  const { tableId } = useParams<{ tableId: string }>();
  const navigate = useNavigate();
  const setTable = useCustomerCartStore((state) => state.setTable);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tableId) {
      setError('ID Meja tidak ditemukan di URL');
      setLoading(false);
      return;
    }

    CustomerService.getPublicTableById(tableId)
      .then((res) => {
        if (res.success && res.data) {
          // Set table details in zustand and localStorage
          setTable(res.data.id, res.data.number, res.data.code);
          
          // Redirect immediately to catalog
          navigate('/customer/catalog', { replace: true });
        } else {
          setError('Meja tidak valid atau sudah tidak aktif');
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to validate table:', err);
        setError('QR Code Meja tidak valid, kadaluwarsa, atau meja sedang dinonaktifkan.');
        setLoading(false);
      });
  }, [tableId, navigate, setTable]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        background: '#FFFBF5',
        fontFamily: "'Inter', sans-serif"
      }}>
        <Spin size="large" style={{ color: '#C2410C' }} />
        <h3 style={{ marginTop: '24px', color: '#1C1917', fontWeight: 600 }}>
          Menghubungkan ke Meja...
        </h3>
        <p style={{ color: '#57534E', margin: 0 }}>
          Mohon tunggu sebentar, sistem sedang memverifikasi lokasi meja Anda.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        background: '#FFFBF5',
        padding: '0 20px',
        fontFamily: "'Inter', sans-serif"
      }}>
        <Result
          status="error"
          title="Verifikasi Meja Gagal"
          subTitle={error}
          extra={[
            <Button 
              type="primary" 
              key="catalog"
              onClick={() => navigate('/customer/catalog', { replace: true })}
              style={{
                backgroundColor: '#C2410C',
                borderColor: '#C2410C',
                borderRadius: '4px',
                fontWeight: 600,
                height: '40px'
              }}
            >
              Lihat Katalog Tanpa Meja
            </Button>
          ]}
          style={{
            maxWidth: '480px',
            background: '#FFFFFF',
            border: '1px solid #E7E5E4',
            borderRadius: '8px',
            padding: '40px 24px',
          }}
        />
      </div>
    );
  }

  return null;
};
