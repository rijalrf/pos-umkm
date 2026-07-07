import React from 'react';
import { Space, Dropdown, Button } from 'antd';
import type { TableColumnsType } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, WarningOutlined, MoreOutlined } from '@ant-design/icons';
import type { ProductItem, ColumnActions } from './products.types';
import { formatCurrency } from '../../libs/format.lib';

const StockCell: React.FC<{ stock: number; threshold: number }> = ({ stock, threshold }) => {
  const isLowStock = stock <= threshold;
  return (
    <Space>
      <span
        className="text-semibold"
        style={{
          color: isLowStock ? '#DC2626' : 'inherit',
          fontWeight: isLowStock ? 700 : 'normal',
        }}
      >
        {stock}
      </span>
      {isLowStock && (
        <WarningOutlined style={{ color: '#F59E0B' }} title="Stok menipis!" />
      )}
    </Space>
  );
};

const ActionsDropdown: React.FC<{ record: ProductItem; actions: ColumnActions }> = ({ record, actions }) => {
  const menu = {
    items: [
      {
        key: 'detail',
        label: 'Detail',
        icon: <EyeOutlined style={{ color: '#3B82F6' }} />,
        onClick: () => actions.onDetail(record),
      },
      {
        key: 'edit',
        label: 'Edit',
        icon: <EditOutlined style={{ color: '#C2410C' }} />,
        onClick: () => actions.onEdit(record),
      },
      { type: 'divider' as const },
      {
        key: 'delete',
        label: 'Hapus',
        icon: <DeleteOutlined />,
        danger: true,
        onClick: () => actions.onDelete(record.id),
      },
    ],
  };

  return (
    <Dropdown menu={menu} trigger={['click']} placement="bottomRight">
      <Button type="text" icon={<MoreOutlined className="text-action-more" />} className="p-0" />
    </Dropdown>
  );
};

export const useProductColumns = (actions: ColumnActions): TableColumnsType<ProductItem> => [
  {
    title: 'Kode',
    dataIndex: 'sku',
    key: 'sku',
    render: (sku: string) => <span style={{ color: '#57534E' }}>{sku}</span>,
  },
  {
    title: 'Nama Produk',
    dataIndex: 'name',
    key: 'name',
    render: (name: string) => <span className="text-semibold">{name}</span>,
  },
  {
    title: 'Kategori',
    dataIndex: ['category', 'name'],
    key: 'categoryName',
    render: (catName: string) => <span>{catName || '-'}</span>,
  },
  {
    title: 'Harga',
    dataIndex: 'price',
    key: 'price',
    render: (price: string) => <span>{formatCurrency(price)}</span>,
  },
  {
    title: 'Stok',
    key: 'stock',
    render: (_: unknown, record: ProductItem) => (
      <StockCell stock={record.stock} threshold={record.stockAlertThreshold} />
    ),
  },
  {
    title: 'Aksi',
    key: 'actions',
    width: 100,
    align: 'center',
    render: (_: unknown, record: ProductItem) => (
      <ActionsDropdown record={record} actions={actions} />
    ),
  },
];
