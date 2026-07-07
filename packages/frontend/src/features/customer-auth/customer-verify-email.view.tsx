import React, { useEffect, useState } from 'react';
import { Card, Result, Button, Spin, Typography } from 'antd';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useCustomerAuthPresenter } from './customer-auth.presenter';

const { Title, Paragraph } = Typography;

export const VerifyEmailView: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const presenter = useCustomerAuthPresenter();
  const [success, setSuccess] = useState<boolean | null>(null);

  const token = searchParams.get('token');

  useEffect(() => {
    async function performVerification() {
      if (token) {
        const isOk = await presenter.verifyEmailToken(token);
        setSuccess(isOk);
      } else {
        setSuccess(false);
      }
    }
    performVerification();
  }, [token, presenter.verifyEmailToken]);

  return (
    <div className="customer-centered">
      <Card className="w-full" style={{ maxWidth: '480px', textAlign: 'center' }}>
        {presenter.loading ? (
          <div className="customer-verify-loading">
            <Spin size="large" />
            <Title level={4}>Verifikasi Email Anda...</Title>
            <Paragraph type="secondary">Kami sedang mencocokkan tautan verifikasi token Anda.</Paragraph>
          </div>
        ) : success ? (
          <Result
            status="success"
            title={<span className="headline-text" style={{ color: 'var(--color-tertiary)' }}>Verifikasi Sukses!</span>}
            subTitle="Akun email member Anda telah berhasil diverifikasi. Anda sekarang dapat masuk untuk menggunakan semua fitur member."
            extra={[
              <Button type="primary" key="login" onClick={() => navigate('/customer/login')} className="btn-primary-terracotta" style={{ height: '40px' }}>
                Masuk Sekarang
              </Button>,
            ]}
          />
        ) : (
          <Result
            status="error"
            title={<span className="headline-text" style={{ color: 'var(--color-error)' }}>Verifikasi Gagal</span>}
            subTitle={presenter.error || 'Token verifikasi tidak ditemukan, salah, atau telah kedaluwarsa.'}
            extra={[
              <Button type="default" key="catalog" onClick={() => navigate('/customer/catalog')} className="btn-cancel" style={{ marginRight: '8px' }}>
                Ke Katalog
              </Button>,
              <Button type="primary" key="register" onClick={() => navigate('/customer/register')} className="btn-primary-terracotta" style={{ height: '40px' }}>
                Daftar Ulang
              </Button>,
            ]}
          />
        )}
      </Card>
    </div>
  );
};

export default VerifyEmailView;
