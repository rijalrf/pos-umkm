import React, { useState, useEffect } from 'react';
import { Button, Form } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useCustomerCartStore } from '../../stores/customer-cart.store';
import { useCustomerCheckoutPresenter } from './customer-checkout.presenter';
import { CheckoutCartStep } from './checkout-cart-step.view';
import { CheckoutSuccessStep } from './checkout-success-step.view';
import type { CheckoutPayload, CheckoutResult } from './customer-checkout.types';

export const CheckoutView: React.FC = () => {
  const navigate = useNavigate();
  const cart = useCustomerCartStore();
  const presenter = useCustomerCheckoutPresenter();
  const [form] = Form.useForm();

  const [checkoutStep, setCheckoutStep] = useState<'checkout' | 'success'>(() => {
    const savedStep = sessionStorage.getItem('customer_checkout_step');
    if (savedStep === 'success') {
      return 'success';
    }
    return 'checkout';
  });
  const [createdTx, setCreatedTx] = useState<CheckoutResult | null>(() => {
    const savedTx = sessionStorage.getItem('customer_created_tx');
    if (savedTx) {
      try {
        return JSON.parse(savedTx) as CheckoutResult;
      } catch {
        return null;
      }
    }
    return null;
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'QRIS'>('CASH');

  const hasInvalidStock = cart.items.some(
    (item) => item.product.stock === 0 || item.quantity > item.product.stock
  );

  useEffect(() => {
    presenter.fetchStoreInfo();
  }, [presenter.fetchStoreInfo]);

  useEffect(() => {
    if (cart.items.length > 0) {
      setCheckoutStep('checkout');
      setCreatedTx(null);
      sessionStorage.removeItem('customer_checkout_step');
      sessionStorage.removeItem('customer_created_tx');
    }
  }, [cart.items.length]);

  useEffect(() => {
    setErrorMessage(null);
    if (checkoutStep === 'checkout') {
      presenter.refreshCartStock();
    }
  }, [checkoutStep, presenter.refreshCartStock]);

  useEffect(() => {
    if (checkoutStep === 'success' && createdTx?.id) {
      let isMounted = true;
      presenter.fetchTransactionStatus(createdTx.id).then((freshTx) => {
        if (isMounted && freshTx) {
          setCreatedTx(freshTx);
          sessionStorage.setItem('customer_created_tx', JSON.stringify(freshTx));
        }
      });
      return () => {
        isMounted = false;
      };
    }
  }, [checkoutStep, createdTx?.id, presenter.fetchTransactionStatus]);

  const storeQris = presenter.storeInfo?.qrisUrl || null;

  const handleQuantityChange = (productId: string, quantity: number) => {
    try {
      cart.updateQuantity(productId, quantity);
    } catch {
      // silent
    }
  };

  const handleFormFinish = async (values: { guestName: string; phone?: string }) => {
    setErrorMessage(null);
    const payload: CheckoutPayload = {
      customerType: 'guest',
      items: cart.items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
      paymentMethod,
    };
    if (values.guestName) payload.guestName = values.guestName;
    if (values.phone && values.phone.trim() !== '') payload.phone = values.phone.trim();
    if (cart.tableId) payload.tableId = cart.tableId;

    try {
      const tx = await presenter.checkout(payload);
      if (tx) {
        setCreatedTx(tx);
        sessionStorage.setItem('customer_checkout_step', 'success');
        sessionStorage.setItem('customer_created_tx', JSON.stringify(tx));
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

  const handleBack = () => {
    if (checkoutStep === 'checkout' || checkoutStep === 'success') {
      sessionStorage.removeItem('customer_checkout_step');
      sessionStorage.removeItem('customer_created_tx');
      navigate('/customer/catalog');
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

      {checkoutStep === 'success' && createdTx && (
        <CheckoutSuccessStep createdTx={createdTx} storeQris={storeQris} />
      )}
    </div>
  );
};

export default CheckoutView;
