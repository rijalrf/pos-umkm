import React, { useState, useEffect } from 'react';
import { Button, Form, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useCustomerCartStore } from '../../stores/customer-cart.store';
import { useCustomerCheckoutPresenter } from './customer-checkout.presenter';
import { CheckoutCartStep } from './checkout-cart-step.view';
import { CheckoutReviewStep } from './checkout-review-step.view';
import { CheckoutSuccessStep } from './checkout-success-step.view';
import type { CheckoutPayload, CheckoutResult } from './customer-checkout.types';

const { Title } = Typography;

export const CheckoutView: React.FC = () => {
  const navigate = useNavigate();
  const cart = useCustomerCartStore();
  const presenter = useCustomerCheckoutPresenter();
  const [form] = Form.useForm();

  const [checkoutStep, setCheckoutStep] = useState<'checkout' | 'review' | 'success'>('checkout');
  const [createdTx, setCreatedTx] = useState<CheckoutResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [buyerName, setBuyerName] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'QRIS'>('CASH');

  const hasInvalidStock = cart.items.some(
    (item) => item.product.stock === 0 || item.quantity > item.product.stock
  );

  useEffect(() => {
    presenter.fetchStoreInfo();
  }, [presenter.fetchStoreInfo]);

  useEffect(() => {
    setErrorMessage(null);
    if (checkoutStep === 'checkout') {
      presenter.refreshCartStock();
    }
  }, [checkoutStep, presenter.refreshCartStock]);

  const storeQris = presenter.storeInfo?.qrisUrl || null;

  const handleQuantityChange = (productId: string, quantity: number) => {
    try {
      cart.updateQuantity(productId, quantity);
    } catch {
      // silent
    }
  };

  const handleCheckout = async () => {
    setErrorMessage(null);
    const payload: CheckoutPayload = {
      customerType: 'guest',
      items: cart.items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
      paymentMethod,
    };
    if (buyerName) payload.guestName = buyerName;
    if (cart.tableId) payload.tableId = cart.tableId;

    try {
      const tx = await presenter.checkout(payload);
      if (tx) {
        setCreatedTx(tx);
        cart.clearCart();
        setCheckoutStep('success');
      }
    } catch (err: unknown) {
      const rawMsg = err instanceof Error ? err.message : '';
      let msg = 'Gagal memproses transaksi. Silakan coba beberapa saat lagi.';
      if (rawMsg.toLowerCase().includes('stock') || rawMsg.toLowerCase().includes('stok') || rawMsg.toLowerCase().includes('insufficient')) {
        msg = 'Ups! Maaf, pesanan kamu ada yang sudah kehabisan stok. Cek lagi yuk!';
      } else if (rawMsg) {
        msg = rawMsg;
      }
      setErrorMessage(msg);
      presenter.refreshCartStock();
    }
  };

  const handleFormFinish = (values: { guestName: string; phone?: string }) => {
    setBuyerName(values.guestName);
    setCheckoutStep('review');
  };

  const handleBack = () => {
    if (checkoutStep === 'checkout' || checkoutStep === 'success') {
      navigate('/customer/catalog');
    } else if (checkoutStep === 'review') {
      setCheckoutStep('checkout');
    }
  };

  return (
    <div className="customer-page-wrapper">
      <Button
        type="text"
        icon={<ArrowLeftOutlined style={{ fontSize: '18px', color: '#1C1917' }} />}
        onClick={handleBack}
        className="btn-back-circle"
      />

      {checkoutStep === 'review' && (
        <Title level={2} className="headline-text" style={{ color: '#1C1917', marginBottom: '24px' }}>
          Review Pesanan
        </Title>
      )}

      {checkoutStep === 'checkout' && (
        <CheckoutCartStep
          loading={presenter.loading}
          errorMessage={errorMessage}
          hasInvalidStock={hasInvalidStock}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          form={form}
          onFinish={handleFormFinish}
          onQuantityChange={handleQuantityChange}
        />
      )}

      {checkoutStep === 'review' && (
        <CheckoutReviewStep
          loading={presenter.loading}
          buyerName={buyerName}
          storeInfo={presenter.storeInfo}
          paymentMethod={paymentMethod}
          storeQris={storeQris}
          onCheckout={handleCheckout}
        />
      )}

      {checkoutStep === 'success' && createdTx && (
        <CheckoutSuccessStep createdTx={createdTx} />
      )}
    </div>
  );
};

export default CheckoutView;
