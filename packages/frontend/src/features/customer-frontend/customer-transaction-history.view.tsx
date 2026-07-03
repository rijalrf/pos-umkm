import React, { useEffect } from 'react';
import { Card, Table, Typography, Spin, Empty, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useCustomerPresenter } from './customer-frontend.presenter';

const { Title, Paragraph } = Typography;

export const TransactionHistoryView: React.FC = () => {
  const navigate = useNavigate();
  const {
    loading,
    transactions,
    fetchHistory,
  } = useCustomerPresenter();

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const formatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  });

  const columns = [
    {
      title: 'Kode Transaksi',
      dataIndex: 'transactionCode',
      key: 'transactionCode',
      render: (text: string) => (
        <span style={{ fontWeight: 600, color: '#C2410C' }}>
          {text}
        </span>
      ),
    },
    {
      title: 'Tanggal Belanja',
      dataIndex: 'transactionDate',
      key: 'transactionDate',
      sorter: (a: any, b: any) => new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime(),
      render: (dateStr: string) => new Date(dateStr).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
    },
    {
      title: 'Produk Yang Dibeli',
      dataIndex: 'items',
      key: 'items',
      render: (items: any[]) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {items.map((item, idx) => (
            <div key={idx} style={{ fontSize: '14px', color: '#1C1917' }}>
              &bull; {item.product.name} <strong>(x{item.quantity})</strong>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: 'Status Pembayaran',
      key: 'status',
      render: () => (
        <span style={{
          background: '#DCFCE7',
          color: '#166534',
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 600,
        }}>
          Lunas (Tunai)
        </span>
      ),
    },
    {
      title: 'Total Belanja',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      align: 'right' as const,
      sorter: (a: any, b: any) => Number(a.totalAmount) - Number(b.totalAmount),
      render: (val: number) => (
        <strong style={{ color: '#1C1917', fontSize: '15px' }}>
          {formatter.format(Number(val))}
        </strong>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0, fontFamily: "'Playfair Display', serif", color: '#C2410C' }}>
          Riwayat Belanja
        </Title>
        <Paragraph style={{ fontFamily: "'Inter', sans-serif", color: '#57534E', fontSize: '15px' }}>
          Berikut adalah daftar transaksi belanja yang Anda lakukan sebagai member POS UMKM.
        </Paragraph>
      </div>

      <Spin spinning={loading}>
        <Card style={{ borderColor: '#E7E5E4', background: '#FFFFFF' }}>
          {transactions.length > 0 ? (
            <Table
              dataSource={transactions}
              columns={columns}
              rowKey="id"
              scroll={{ x: true }}
              pagination={{ pageSize: 10 }}
              bordered={false}
              expandable={{
                expandedRowRender: (record: unknown) => {
                  const tx = record as {
                    items: { product: { name: string }; quantity: number; priceAtPurchase: number }[];
                    totalAmount: number;
                    cashReceived: number;
                    cashReturn: number;
                  };
                  return (
                  <div style={{ padding: '8px 24px', background: '#FFFBF5', borderRadius: '4px', borderLeft: '3px solid #C2410C' }}>
                    <Title level={5} style={{ fontFamily: "'Playfair Display', serif", margin: '0 0 12px 0' }}>Rincian Pembayaran</Title>
                    <table style={{ width: '100%', maxWidth: '400px', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <tbody>
                        {tx.items.map((item, idx: number) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #E7E5E4' }}>
                            <td style={{ padding: '6px 0', color: '#57534E' }}>{item.product.name} (x{item.quantity})</td>
                            <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 500 }}>
                              {formatter.format(Number(item.priceAtPurchase) * item.quantity)}
                            </td>
                          </tr>
                        ))}
                        <tr>
                          <td style={{ padding: '12px 0 6px 0', fontWeight: 'bold' }}>Total Bayar</td>
                          <td style={{ padding: '12px 0 6px 0', textAlign: 'right', fontWeight: 'bold', color: '#C2410C' }}>
                            {formatter.format(Number(tx.totalAmount))}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ padding: '6px 0', color: '#57534E' }}>Uang Diterima</td>
                          <td style={{ padding: '6px 0', textAlign: 'right', color: '#57534E' }}>
                            {formatter.format(Number(tx.cashReceived))}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ padding: '6px 0', color: '#365314', fontWeight: 600 }}>Kembalian</td>
                          <td style={{ padding: '6px 0', textAlign: 'right', color: '#365314', fontWeight: 600 }}>
                            {formatter.format(Number(tx.cashReturn))}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  );
                },
                rowExpandable: () => true,
              }}
            />
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Anda belum memiliki riwayat transaksi belanja"
              style={{ padding: '40px 0' }}
            >
              <Button type="primary" onClick={() => navigate('/customer/catalog')} style={{ backgroundColor: '#C2410C', borderColor: '#C2410C' }}>
                Mulai Berbelanja
              </Button>
            </Empty>
          )}
        </Card>
      </Spin>
    </div>
  );
};

export default TransactionHistoryView;
