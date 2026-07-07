import React, { useEffect, useMemo } from 'react';
import { Card, Table, Input, Typography, Spin } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useCustomersPresenter } from './customers.presenter';
import { DEFAULT_PAGINATION } from '../../libs/pagination.lib';

const { Title, Paragraph } = Typography;

export const CustomerListView: React.FC = () => {
  const presenter = useCustomersPresenter();

  useEffect(() => {
    presenter.fetchCustomers();
  }, []);

  const maskPhone = (phone?: string) => {
    if (!phone) return '-';
    if (phone.length <= 7) {
      return phone.slice(0, 3) + '*'.repeat(phone.length - 3);
    }
    return phone.slice(0, 4) + '*'.repeat(phone.length - 7) + phone.slice(-3);
  };

  const filteredCustomers = useMemo(() => {
    if (!presenter.search.trim()) return presenter.customers;
    const q = presenter.search.toLowerCase();
    return presenter.customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.phone && c.phone.toLowerCase().includes(q))
    );
  }, [presenter.customers, presenter.search]);

  const columns = [
    {
      title: 'Nama Lengkap',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Nomor HP',
      dataIndex: 'phone',
      key: 'phone',
      render: (text: string | undefined) => maskPhone(text),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <Title level={2} className="page-title">Pelanggan</Title>
          <Paragraph className="page-subtitle">
            Kelola dan lihat data pelanggan member terdaftar.
          </Paragraph>
        </div>
      </div>

      <Card className="card-filter">
        <div className="search-bar">
          <Input
            placeholder="Cari berdasarkan nama atau nomor HP..."
            prefix={<SearchOutlined />}
            value={presenter.search}
            onChange={(e) => presenter.setSearch(e.target.value)}
            className="input-search"
            allowClear
          />
        </div>

        <Spin spinning={presenter.loading}>
          <Table
            dataSource={filteredCustomers}
            columns={columns}
            rowKey="id"
            pagination={DEFAULT_PAGINATION}
          />
        </Spin>
      </Card>
    </div>
  );
};
