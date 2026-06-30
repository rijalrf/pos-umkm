import React, { useEffect, useState } from 'react';
import { Card, Result, Button, Spin, Typography } from 'antd';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useCustomerPresenter } from './customer.presenter';

const { Title, Paragraph } = Typography;

export const VerifyEmailView: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyEmailToken, loading, error } = useCustomerPresenter();
  const [success, setSuccess] = useState<boolean | null>(null);

  const token = searchParams.get('token');

  useEffect(() => {
    async function performVerification() {
      if (token) {
        const isOk = await verifyEmailToken(token);
        setSuccess(isOk);
      } else {
        setSuccess(false);
      }
    }
    performVerification();
  }, [token]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 240px)', padding: '24px 0' }}>
      <Card
        style={{
          width: '100%',
          maxWidth: '480px',
          borderColor: '#D6D3D1',
          borderRadius: '8px',
          background: '#FFFFFF',
          textAlign: 'center',
        }}
        bodyStyle={{ padding: '40px' }}
      >
        {loading ? (
          <div style={{ padding: '40px 0' }}>
            <Spin size="large" />
            <Title level={4} style={{ marginTop: '24px', fontFamily: "'Inter', sans-serif" }}>Verifikasi Email Anda...</Title>
            <Paragraph type="secondary">Kami sedang mencocokkan tautan verifikasi token Anda.</Paragraph>
          </div>
        ) : success ? (
          <Result
            status="success"
            title={<span style={{ fontFamily: "'Playfair Display', serif", color: '#365314' }}>Verifikasi Sukses!</span>}
            subTitle="Akun email member Anda telah berhasil diverifikasi. Anda sekarang dapat masuk untuk menggunakan semua fitur member."
            extra={[
              <Button
                type="primary"
                key="login"
                onClick={() => navigate('/customer/login')}
                style={{ backgroundColor: '#C2410C', borderColor: '#C2410C', fontWeight: 600, height: '40px' }}
              >
                Masuk Sekarang
              </Button>
            ]}
          />
        ) : (
          <Result
            status="error"
            title={<span style={{ fontFamily: "'Playfair Display', serif", color: '#DC2626' }}>Verifikasi Gagal</span>}
            subTitle={error || 'Token verifikasi tidak ditemukan, salah, atau telah kedaluwarsa.'}
            extra={[
              <Button
                type="default"
                key="catalog"
                onClick={() => navigate('/customer/catalog')}
                style={{ marginRight: '8px', height: '40px' }}
              >
                Ke Katalog
              </Button>,
              <Button
                type="primary"
                key="register"
                onClick={() => navigate('/customer/register')}
                style={{ backgroundColor: '#C2410C', borderColor: '#C2410C', fontWeight: 600, height: '40px' }}
              >
                Daftar Ulang
              </Button>
            ]}
          />
        )}
      </Card>
    </div>
  );
};

export default VerifyEmailView;
