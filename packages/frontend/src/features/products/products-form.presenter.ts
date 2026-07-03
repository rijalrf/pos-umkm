import { useState } from 'react';
import { ProductsService } from './products.service';
import { ProductPayload, ProductItem } from './products.types';
import { message } from 'antd';
import { AxiosError } from 'axios';

export function useProductFormPresenter() {
  const [confirmLoading, setConfirmLoading] = useState(false);

  const handleSubmit = async (
    values: ProductPayload,
    editingProduct: ProductItem | null,
    file: File | null,
    onSuccess: () => void
  ) => {
    setConfirmLoading(true);
    try {
      let productId = '';
      let isUpdate = false;

      if (editingProduct) {
        isUpdate = true;
        productId = editingProduct.id;
        const response = await ProductsService.update(productId, values);
        if (!response.success) {
          throw new Error(response.message || 'Gagal memperbarui produk');
        }
      } else {
        const response = await ProductsService.create(values);
        if (response.success && response.data) {
          productId = response.data.id;
        } else {
          throw new Error(response.message || 'Gagal menambahkan produk');
        }
      }

      if (file && productId) {
        try {
          message.loading({ content: 'Mengunggah gambar...', key: 'uploading' });
          const uploadRes = await ProductsService.uploadImage(productId, file);
          if (uploadRes.success) {
            message.success({ content: 'Gambar berhasil diunggah!', key: 'uploading' });
          } else {
            message.warning({ content: 'Produk berhasil disimpan, tetapi gagal mengunggah gambar', key: 'uploading' });
          }
        } catch {
          message.warning({ content: 'Produk berhasil disimpan, tetapi gagal mengunggah gambar', key: 'uploading' });
        }
      }

      message.success(`Produk berhasil ${isUpdate ? 'diperbarui' : 'ditambahkan'}`);
      onSuccess();
    } catch (error: unknown) {
      const errMsg = error instanceof AxiosError ? error.response?.data?.message : error instanceof Error ? error.message : 'Terjadi kesalahan';
      message.error(errMsg);
    } finally {
      setConfirmLoading(false);
    }
  };

  return {
    confirmLoading,
    handleSubmit,
    setConfirmLoading,
  };
}
