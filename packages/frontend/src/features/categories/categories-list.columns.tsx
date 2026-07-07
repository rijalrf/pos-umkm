import React from 'react';
import { Dropdown, Button } from 'antd';
import type { TableColumnsType } from 'antd';
import { EditOutlined, DeleteOutlined, MoreOutlined } from '@ant-design/icons';
import type { CategoryItem } from './categories.types';

interface ColumnActions {
  onEdit: (record: CategoryItem) => void;
  onDelete: (id: string) => void;
}

const ActionsDropdown: React.FC<{ record: CategoryItem; actions: ColumnActions }> = ({ record, actions }) => {
  const menu = {
    items: [
      {
        key: 'edit',
        label: 'Edit',
        icon: <EditOutlined className="text-primary-color" />,
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

export const useCategoryColumns = (actions: ColumnActions): TableColumnsType<CategoryItem> => [
  {
    title: 'Nama Kategori',
    dataIndex: 'name',
    key: 'name',
    render: (text: string) => <span className="text-semibold">{text}</span>,
  },
  {
    title: 'Deskripsi',
    dataIndex: 'description',
    key: 'description',
    render: (text: string | null) => text || <span className="text-secondary-muted">Tidak ada deskripsi</span>,
  },
  {
    title: 'Aksi',
    key: 'actions',
    width: 100,
    align: 'center',
    render: (_: unknown, record: CategoryItem) => (
      <ActionsDropdown record={record} actions={actions} />
    ),
  },
];
