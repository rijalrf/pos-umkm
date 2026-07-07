import { useState, useEffect } from 'react';
import { Form, message } from 'antd';
import { CategoriesService } from './categories.service';
import { CategoryItem, CategoryPayload } from './categories.types';
import { AxiosError } from 'axios';

export const useCategoriesPresenter = () => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [categoryIdToDelete, setCategoryIdToDelete] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await CategoriesService.getAll();
      if (response.success) {
        setCategories(response.data);
      } else {
        message.error(response.message || 'Gagal mengambil data kategori');
      }
    } catch (error) {
      const msg = error instanceof AxiosError ? error.response?.data?.message : 'Gagal mengambil data kategori';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAddModal = () => {
    setEditingId(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (record: CategoryItem) => {
    setEditingId(record.id);
    form.setFieldsValue({
      name: record.name,
      description: record.description,
    });
    setIsModalOpen(true);
  };

  const handleCancelModal = () => {
    setIsModalOpen(false);
  };

  const handleDeleteClick = (id: string) => {
    setCategoryIdToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setCategoryIdToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!categoryIdToDelete) return;
    setDeleteLoading(true);
    try {
      const response = await CategoriesService.delete(categoryIdToDelete);
      if (response.success) {
        message.success('Kategori berhasil dihapus');
        await fetchCategories();
      } else {
        message.error(response.message || 'Gagal menghapus kategori');
      }
    } catch (error) {
      const msg = error instanceof AxiosError ? error.response?.data?.message : 'Gagal menghapus kategori';
      message.error(msg);
    } finally {
      setDeleteLoading(false);
      setDeleteConfirmOpen(false);
      setCategoryIdToDelete(null);
    }
  };

  const handleFormSubmit = async (values: CategoryPayload) => {
    setSubmitLoading(true);
    try {
      if (editingId) {
        const response = await CategoriesService.update(editingId, values);
        if (response.success) {
          message.success('Kategori berhasil diperbarui');
          setIsModalOpen(false);
          await fetchCategories();
        } else {
          message.error(response.message || 'Gagal memperbarui kategori');
        }
      } else {
        const response = await CategoriesService.create(values);
        if (response.success) {
          message.success('Kategori berhasil dibuat');
          setIsModalOpen(false);
          await fetchCategories();
        } else {
          message.error(response.message || 'Gagal membuat kategori');
        }
      }
    } catch (error) {
      const msg = error instanceof AxiosError ? error.response?.data?.message : 'Gagal memproses permintaan';
      message.error(msg);
    } finally {
      setSubmitLoading(false);
    }
  };

  return {
    categories,
    loading,
    isModalOpen,
    form,
    editingId,
    submitLoading,
    deleteConfirmOpen,
    deleteLoading,
    handleOpenAddModal,
    handleOpenEditModal,
    handleCancelModal,
    handleDeleteClick,
    handleCancelDelete,
    handleDeleteConfirm,
    handleFormSubmit,
    fetchCategories,
  };
};
