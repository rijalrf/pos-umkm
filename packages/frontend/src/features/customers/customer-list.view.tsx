import React, { useEffect, useState, useMemo } from 'react';
import { Card, Table, Input, Typography, Spin, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { CustomersService, CustomerPayload } from './customers.service';

const { Title, Paragraph } = Typography;

export const CustomerListView: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<CustomerPayload[]>([]);
  const [search, setSearch] = useState('');

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await CustomersService.getAll();
      if (res.success) {
        setCustomers(res.data);
      }
    } catch (e: any) {
      console.error(e);
      message.error('Gagal memuat data pelanggan!');
    } finally {
      setLoading(false);
    }
  };

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
      render: (text: string) => <strong style={{ color: '#1C1917' }}>{text}</strong>,
    },
    {
      title: 'Nomor HP',
      dataIndex: 'phone',
      key: 'phone',
      render: (text: string) => maskPhone(text),
    },
    {
      title: 'Status Verifikasi',
      dataIndex: 'isEmailVerified',
      key: 'isEmailVerified',
      render: (isVerified: boolean) => (
        <span
          style={{
            display: 'inline-block',
            padding: '2px 8px',
            fontSize: '12px',
            fontWeight: 600,
            borderRadius: '4px',
            backgroundColor: isVerified ? '#DCFCE7' : '#FEE2E2',
            color: isVerified ? '#166534' : '#991B1B',
            border: `1px solid ${isVerified ? '#BBF7D0' : '#FCA5A5'}`,
          }}
        >
          {isVerified ? 'Terverifikasi' : 'Belum Verifikasi'}
        </span>
      ),
    },
    {
      title: 'Alamat',
      dataIndex: 'address',
      key: 'address',
      render: (text: string) => text || '-',
    },
  ];

  return (
    <div style={{ width: '100%' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ fontFamily: "'Inter', sans-serif", color: '#C2410C', margin: 0 }}>
          Pelanggan
        </Title>
        <Paragraph style={{ fontFamily: "'Inter', sans-serif", color: '#57534E', marginTop: '4px', marginBottom: 0 }}>
          Kelola dan lihat data pelanggan member terdaftar.
        </Paragraph>
      </div>

      <Card
        style={{
          border: '1px solid #E7E5E4',
          borderRadius: '8px',
          backgroundColor: '#FFFFFF',
        }}
        bodyStyle={{ padding: '24px' }}
      >
        <div style={{ marginBottom: '24px' }}>
          <Input
            placeholder="Cari berdasarkan nama, nomor HP, atau alamat..."
            prefix={<SearchOutlined style={{ color: '#A8A29E' }} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '320px', height: '42px', borderRadius: '4px' }}
            allowClear
          />
        </div>

        <Spin spinning={loading}>
          <Table
            dataSource={filteredCustomers}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            bordered={false}
          />
        </Spin>
      </Card>
    </div>
  );
};
