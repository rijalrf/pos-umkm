import React, { useEffect, useState } from 'react';
import { Table, Button, Input, DatePicker, Space, Typography, Modal, Card } from 'antd';
import { SearchOutlined, PrinterOutlined, CalendarOutlined, EyeOutlined } from '@ant-design/icons';
import { useTransactionsPresenter } from './transactions.presenter';

const { Title, Paragraph, Text } = Typography;
const { RangePicker } = DatePicker;

export const TransactionListView: React.FC = () => {
  const {
    transactions,
    total,
    loading,
    query,
    fetchTransactions,
    handleSearch,
    handleDateFilter,
    handlePageChange,
  } = useTransactionsPresenter();

  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const formatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  });

  const handleRangeChange = (dates: any, dateStrings: [string, string]) => {
    if (dates) {
      handleDateFilter(dateStrings[0], dateStrings[1]);
    } else {
      handleDateFilter(undefined, undefined);
    }
  };

  const showReceipt = (id: string) => {
    setSelectedTxId(id);
    setReceiptModalOpen(true);
  };

  const columns = [
    {
      title: 'Kode Transaksi',
      dataIndex: 'transactionCode',
      key: 'transactionCode',
      render: (text: string) => (
        <code style={{ fontFamily: "'Source Code Pro', monospace", fontWeight: 600, color: '#C2410C' }}>
          {text}
        </code>
      ),
    },
    {
      title: 'Tanggal & Waktu',
      dataIndex: 'transactionDate',
      key: 'transactionDate',
      render: (dateStr: string) => new Date(dateStr).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
    },
    {
      title: 'Kasir',
      dataIndex: 'cashier',
      key: 'cashier',
      render: (cashier: any) => cashier?.fullName || 'System',
    },
    {
      title: 'Pelanggan',
      dataIndex: 'customerName',
      key: 'customerName',
      render: (text: string) => text || <Text type="secondary">Pelanggan Umum</Text>,
    },
    {
      title: 'Total Belanja',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      align: 'right' as const,
      render: (val: number) => <strong style={{ color: '#1C1917' }}>{formatter.format(Number(val))}</strong>,
    },
    {
      title: 'Aksi',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EyeOutlined style={{ color: '#C2410C' }} />}
            onClick={() => showReceipt(record.id)}
            style={{ padding: 0 }}
          />
          <Button
            type="text"
            icon={<PrinterOutlined style={{ color: '#57534E' }} />}
            onClick={() => showReceipt(record.id)}
            style={{ padding: 0 }}
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <Title level={2} style={{ margin: 0, fontFamily: "'Inter', sans-serif", color: '#C2410C' }}>
            Penjualan
          </Title>
          <Paragraph style={{ margin: 0, fontFamily: "'Inter', sans-serif", color: '#57534E' }}>
            Lihat, cari, dan tinjau seluruh transaksi penjualan sebelumnya serta cetak struk.
          </Paragraph>
        </div>
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
          <Space wrap style={{ width: '100%', justifyContent: 'space-between' }}>
            <Input.Search
              placeholder="Cari berdasarkan Kode atau Nama Pelanggan..."
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={handleSearch}
              style={{ width: 320 }}
            />

            <Space wrap>
              <span style={{ fontWeight: 600, color: '#1C1917', fontFamily: "'Inter', sans-serif" }}>
                <CalendarOutlined /> Filter Tanggal:
              </span>
              <RangePicker
                onChange={handleRangeChange}
                placeholder={['Tanggal Mulai', 'Tanggal Selesai']}
                style={{ borderColor: '#D6D3D1' }}
              />
            </Space>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={transactions}
          rowKey="id"
          loading={loading}
          pagination={{
            current: query.page,
            pageSize: query.limit,
            total: total,
            onChange: handlePageChange,
            showSizeChanger: true,
          }}
          style={{ fontFamily: "'Inter', sans-serif" }}
        />
      </Card>

      {/* Printable Receipt Modal */}
      <Modal
        title={<span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700 }}>Struk Transaksi</span>}
        open={receiptModalOpen}
        onCancel={() => {
          setReceiptModalOpen(false);
          setSelectedTxId(null);
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setReceiptModalOpen(false);
              setSelectedTxId(null);
            }}
          >
            Tutup
          </Button>,
          <Button
            key="print"
            type="primary"
            icon={<PrinterOutlined />}
            onClick={() => {
              const iframe = document.getElementById('receipt-iframe-history') as HTMLIFrameElement;
              if (iframe) {
                iframe.contentWindow?.print();
              }
            }}
            style={{ backgroundColor: '#C2410C', borderColor: '#C2410C' }}
          >
            Cetak Struk
          </Button>,
        ]}
        width={400}
        destroyOnClose
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '12px' }}>
          {selectedTxId && (
            <iframe
              id="receipt-iframe-history"
              src={`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/transactions/${selectedTxId}/receipt`}
              style={{
                width: '300px',
                height: '450px',
                border: '1px solid #D6D3D1',
                borderRadius: '4px',
                backgroundColor: '#FFFFFF',
              }}
            />
          )}
        </div>
      </Modal>
    </div>
  );
};

export default TransactionListView;
