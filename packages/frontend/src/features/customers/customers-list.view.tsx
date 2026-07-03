import React, { useEffect, useMemo } from 'react';
import { Card, Table, Input, Typography, Spin } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useCustomersPresenter } from './customers.presenter';

const { Title, Paragraph } = Typography;

export const CustomerListView: React.FC = () => {
  const { loading, customers, search, setSearch, fetchCustomers } = useCustomersPresenter();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const maskPhone = (phone?: string) => {
    if (!phone) return '-';
    if (phone.length <= 7) {
      return phone.slice(0, 3) + '*'.repeat(phone.length - 3);
    }
    return phone.slice(0, 4) + '*'.repeat(phone.length - 7) + phone.slice(-3);
  };

  const filteredCustomers = useMemo(() => {
    if (!search.trim()) return customers;
    const q = search.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.phone && c.phone.toLowerCase().includes(q)) ||
        (c.address && c.address.toLowerCase().includes(q))
    );
  }, [customers, search]);

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
    {
      title: 'Status Verifikasi',
      dataIndex: 'isEmailVerified',
      key: 'isEmailVerified',
      render: (isVerified: boolean) => (
        <span className={`status-chip ${isVerified ? 'status-chip-success' : 'status-chip-error'}`}>
          {isVerified ? 'Terverifikasi' : 'Belum Verifikasi'}
        </span>
      ),
    },
    {
      title: 'Alamat',
      dataIndex: 'address',
      key: 'address',
      render: (text: string | null | undefined) => text || '-',
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
            placeholder="Cari berdasarkan nama, nomor HP, atau alamat..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-search"
            allowClear
          />
        </div>

        <Spin spinning={loading}>
          <Table
            dataSource={filteredCustomers}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Spin>
      </Card>
    </div>
  );
};
