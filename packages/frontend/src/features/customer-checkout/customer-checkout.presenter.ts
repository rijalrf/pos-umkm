import { useState, useCallback } from 'react';
import { CustomerCheckoutService } from './customer-checkout.service';
import { CustomerCatalogService } from '../customer-catalog/customer-catalog.service';
import { CheckoutPayload, StoreInfoData } from './customer-checkout.types';
import { useCustomerCartStore } from '../../stores/customer-cart.store';
import { message } from 'antd';
import { AxiosError } from 'axios';

export function useCustomerCheckoutPresenter() {
  const [loading, setLoading] = useState(false);
  const [storeInfo, setStoreInfo] = useState<StoreInfoData | null>(null);

  const fetchStoreInfo = useCallback(async () => {
    try {
      const res = await CustomerCatalogService.getPublicStoreInfo();
      if (res?.data) {
        setStoreInfo(res.data);
      }
    } catch (err: unknown) {
      const msg = err instanceof AxiosError ? err.response?.data?.message : 'Gagal memuat info toko';
      message.error(msg);
    }
  }, []);

  const refreshCartStock = useCallback(async () => {
    const cart = useCustomerCartStore.getState();
    if (cart.items.length === 0) return;
    const updatedItems = await Promise.all(
      cart.items.map(async (item) => {
        try {
          const res = await CustomerCatalogService.getPublicProductById(item.product.id);
          if (res.success && res.data) {
            return { ...item, product: { ...item.product, stock: res.data.stock } };
          }
        } catch {
          // silent
        }
        return item;
      })
    );
    useCustomerCartStore.setState({ items: updatedItems });
  }, []);

  const checkout = async (payload: CheckoutPayload) => {
    setLoading(true);
    try {
      const res = await CustomerCheckoutService.publicCheckout(payload);
      if (res.success) {
        return res.data;
      }
      return null;
    } catch (err: unknown) {
      const msg = err instanceof AxiosError ? err.response?.data?.message : 'Gagal memproses checkout';
      message.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    storeInfo,
    fetchStoreInfo,
    refreshCartStock,
    checkout,
  };
}
