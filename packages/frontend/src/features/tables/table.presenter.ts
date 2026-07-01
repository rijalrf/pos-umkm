import { useState, useEffect, useCallback } from 'react';
import { TableService, TablePayload } from './table.service';
import { message } from 'antd';

export interface TableItem {
  id: string;
  code: string;
  number: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export function useTablePresenter() {
  const [tables, setTables] = useState<TableItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<TableItem | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  const fetchTables = useCallback(async () => {
    setLoading(true);
    try {
      const response = await TableService.getAll({
        search: search || undefined,
        status: statusFilter || undefined,
      });
      if (response.success) {
        setTables(response.data);
      } else {
        message.error(response.message || 'Gagal memuat daftar meja');
      }
    } catch (error: any) {
      console.error(error);
      message.error(error.response?.data?.message || 'Error memuat daftar meja');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  const handleCreate = async (values: TablePayload) => {
    setSubmitLoading(true);
    try {
      const response = await TableService.create(values);
      if (response.success) {
        message.success('Meja berhasil ditambahkan');
        setIsModalOpen(false);
        fetchTables();
        return true;
      } else {
        message.error(response.message || 'Gagal menambahkan meja');
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Gagal menambahkan meja');
    } finally {
      setSubmitLoading(false);
    }
    return false;
  };

  const handleUpdate = async (id: string, values: TablePayload) => {
    setSubmitLoading(true);
    try {
      const response = await TableService.update(id, values);
      if (response.success) {
        message.success('Meja berhasil diperbarui');
        setIsModalOpen(false);
        setEditingId(null);
        fetchTables();
        return true;
      } else {
        message.error(response.message || 'Gagal memperbarui meja');
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Gagal memperbarui meja');
    } finally {
      setSubmitLoading(false);
    }
    return false;
  };

  const handleDelete = async (id: string) => {
    setDeleteLoading(true);
    try {
      const response = await TableService.delete(id);
      if (response.success) {
        message.success('Meja berhasil dihapus');
        fetchTables();
        return true;
      } else {
        message.error(response.message || 'Gagal menghapus meja');
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Gagal menghapus meja');
    } finally {
      setDeleteLoading(false);
    }
    return false;
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (record: TableItem) => {
    setEditingId(record.id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleOpenQrModal = (record: TableItem) => {
    setSelectedTable(record);
    setIsQrModalOpen(true);
  };

  const handleCloseQrModal = () => {
    setIsQrModalOpen(false);
    setSelectedTable(null);
  };

  return {
    tables,
    loading,
    submitLoading,
    deleteLoading,
    isModalOpen,
    isQrModalOpen,
    editingId,
    selectedTable,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    fetchTables,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleOpenAddModal,
    handleOpenEditModal,
    handleCloseModal,
    handleOpenQrModal,
    handleCloseQrModal,
  };
}
