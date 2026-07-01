import React, { useEffect, useState } from 'react';
import { Table, Button, Input, DatePicker, Space, Typography, Modal, Card, message, Dropdown, Tag } from 'antd';
import { SearchOutlined, PrinterOutlined, CalendarOutlined, EyeOutlined, MoreOutlined } from '@ant-design/icons';
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

  // Detail Modal states
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<any | null>(null);
  const [storeSetting, setStoreSetting] = useState<any | null>(null);

  useEffect(() => {
    fetchTransactions();
    // Load store settings for printing/receipts
    const loadSettings = async () => {
      try {
        const { SettingsService } = await import('../settings/settings.service');
        const res = await SettingsService.getStoreSetting();
        if (res.success) {
          setStoreSetting(res.data);
        }
      } catch (err) {
        console.error('Failed to load store settings', err);
      }
    };
    loadSettings();
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

  const showDetail = (tx: any) => {
    setSelectedTx(tx);
    setDetailModalOpen(true);
  };

  const printReceipt = (tx: any) => {
    if (!tx) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      message.error('Gagal membuka jendela cetak. Pastikan pop-up tidak diblokir oleh browser!');
      return;
    }
    
    const dateStr = new Date(tx.transactionDate).toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });

    const itemsHtml = tx.items.map((item: any) => `
      <tr>
        <td style="padding: 4px 0; font-family: monospace; font-size: 13px;">
          ${item.product.name}<br/>
          <span style="font-size: 11px; color: #555;">${item.quantity} x ${formatter.format(Number(item.price))}</span>
        </td>
        <td style="text-align: right; padding: 4px 0; font-family: monospace; font-size: 13px; vertical-align: bottom;">
          ${formatter.format(Number(item.quantity) * Number(item.price))}
        </td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Struk POS - ${tx.transactionCode}</title>
          <style>
            @page { size: 80mm auto; margin: 0; }
            body {
              font-family: 'Courier New', Courier, monospace;
              width: 72mm;
              margin: 0 auto;
              padding: 10px;
              color: #000;
            }
            .text-center { text-align: center; }
            .divider { border-top: 1px dashed #000; margin: 8px 0; }
            table { width: 100%; border-collapse: collapse; }
          </style>
        </head>
        <body>
          <div class="text-center">
            <h3 style="margin: 0; font-size: 16px;">${storeSetting?.storeName || 'Kantin Nusantara'}</h3>
            <p style="margin: 4px 0; font-size: 11px;">${storeSetting?.address || ''}</p>
            <p style="margin: 4px 0; font-size: 11px;">Telp: ${storeSetting?.phone || ''}</p>
          </div>
          <div class="divider"></div>
          <div style="font-size: 11px; line-height: 1.4;">
            <strong>No:</strong> ${tx.transactionCode}<br/>
            <strong>Tgl:</strong> ${dateStr}<br/>
            <strong>Kasir:</strong> ${tx.cashier?.fullName || 'System'}<br/>
            <strong>Pelanggan:</strong> ${tx.customerName || 'Tamu'}<br/>
            ${tx.tableNumber ? `<strong>Meja:</strong> ${tx.tableNumber}<br/>` : ''}
          </div>
          <div class="divider"></div>
          <table>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          <div class="divider"></div>
          <table style="font-size: 12px; font-weight: bold; line-height: 1.4;">
            <tr>
              <td>Total Tagihan</td>
              <td style="text-align: right;">${formatter.format(Number(tx.totalAmount))}</td>
            </tr>
            <tr>
              <td>Uang Diterima</td>
              <td style="text-align: right;">${formatter.format(Number(tx.cashReceived))}</td>
            </tr>
            <tr>
              <td>Kembalian</td>
              <td style="text-align: right;">${formatter.format(Number(tx.cashReceived) - Number(tx.totalAmount))}</td>
            </tr>
          </table>
          <div class="divider"></div>
          <div class="text-center" style="font-size: 11px; margin-top: 15px;">
            Terima Kasih atas Kunjungan Anda!<br/>
            POS UMKM Premium
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
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
      render: (text: string, record: any) => (
        <Space direction="vertical" size={0}>
          <span>{text || <Text type="secondary">Pelanggan Umum</Text>}</span>
          {record.tableNumber && (
            <Tag color="orange" style={{ margin: 0, fontSize: '11px', borderRadius: '4px' }}>
              {record.tableNumber}
            </Tag>
          )}
        </Space>
      ),
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
      width: 100,
      align: 'center' as const,
      render: (_: any, record: any) => {
        const actionMenu = {
          items: [
            {
              key: 'detail',
              label: 'Detail',
              icon: <EyeOutlined style={{ color: '#3B82F6' }} />,
              onClick: () => showDetail(record)
            },
            {
              key: 'print',
              label: 'Cetak Struk',
              icon: <PrinterOutlined style={{ color: '#C2410C' }} />,
              onClick: () => printReceipt(record)
            }
          ]
        };

        return (
          <Dropdown menu={actionMenu} trigger={['click']} placement="bottomRight">
            <Button
              type="text"
              icon={<MoreOutlined style={{ fontSize: '18px', color: '#57534E' }} />}
              style={{ padding: 0 }}
            />
          </Dropdown>
        );
      }
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

      {/* Transaction Detail Modal */}
      <Modal
        title={<span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, color: '#C2410C' }}>Detail Penjualan</span>}
        open={detailModalOpen}
        onCancel={() => {
          setDetailModalOpen(false);
          setSelectedTx(null);
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setDetailModalOpen(false);
              setSelectedTx(null);
            }}
          >
            Tutup
          </Button>,
          <Button
            key="print"
            type="primary"
            icon={<PrinterOutlined />}
            onClick={() => printReceipt(selectedTx)}
            style={{ backgroundColor: '#C2410C', borderColor: '#C2410C' }}
            disabled={!selectedTx}
          >
            Cetak Struk
          </Button>,
        ]}
        width={750}
        destroyOnClose
      >
        {selectedTx && (
            <div style={{ marginTop: '16px' }}>
              {/* Meta Info grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                padding: '16px',
                backgroundColor: '#FFFBF5',
                border: '1px solid #E7E5E4',
                borderRadius: '8px',
                marginBottom: '20px',
                fontFamily: "'Inter', sans-serif"
              }}>
                <div>
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#878685', display: 'block' }}>Kode Transaksi</span>
                    <strong style={{ fontSize: '14px', color: '#1C1917', fontFamily: "'Source Code Pro', monospace" }}>{selectedTx.transactionCode}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: '#878685', display: 'block' }}>Waktu Transaksi</span>
                    <span style={{ fontSize: '14px', color: '#1C1917' }}>
                      {new Date(selectedTx.transactionDate).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>
                </div>
                <div>
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#878685', display: 'block' }}>Kasir yang Bertugas</span>
                    <span style={{ fontSize: '14px', color: '#1C1917', fontWeight: 600 }}>{selectedTx.cashier?.fullName || 'System'}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: '#878685', display: 'block' }}>Pelanggan</span>
                    <span style={{ fontSize: '14px', color: '#1C1917', fontWeight: 600 }}>
                      {selectedTx.customerName || 'Tamu'}
                      {selectedTx.tableNumber && (
                        <span style={{ marginLeft: '8px', color: '#C2410C' }}>
                          ({selectedTx.tableNumber})
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <Table
                dataSource={selectedTx.items}
                rowKey="id"
                pagination={false}
                bordered={false}
                size="small"
                columns={[
                  {
                    title: 'Produk',
                    key: 'product',
                    render: (_: any, item: any) => (
                      <div>
                        <strong style={{ color: '#1C1917' }}>{item.product.name}</strong>
                        <span style={{ display: 'block', fontSize: '11px', color: '#878685', fontFamily: "'Source Code Pro', monospace" }}>{item.product.sku}</span>
                      </div>
                    )
                  },
                  {
                    title: 'Harga Satuan',
                    dataIndex: 'priceAtPurchase',
                    key: 'priceAtPurchase',
                    align: 'right',
                    render: (val: number) => formatter.format(Number(val))
                  },
                  {
                    title: 'Jumlah (Qty)',
                    dataIndex: 'quantity',
                    key: 'quantity',
                    align: 'center',
                    render: (val: number) => <strong>{val}</strong>
                  },
                  {
                    title: 'Subtotal',
                    key: 'subtotal',
                    align: 'right',
                    render: (_: any, item: any) => (
                      <strong style={{ color: '#1C1917' }}>{formatter.format(Number(item.subtotal))}</strong>
                    )
                  }
                ]}
                style={{ marginBottom: '20px' }}
              />

              {/* Calculations Panel */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                <div style={{ width: '280px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <Text style={{ fontSize: '14px', color: '#57534E' }}>Total Tagihan</Text>
                    <strong style={{ fontSize: '16px', color: '#C2410C' }}>{formatter.format(Number(selectedTx.totalAmount))}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <Text style={{ fontSize: '14px', color: '#57534E' }}>Uang Diterima</Text>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{formatter.format(Number(selectedTx.cashReceived))}</span>
                  </div>
                  <div style={{ borderTop: '1px solid #E7E5E4', margin: '8px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong style={{ fontSize: '14px', color: '#1C1917' }}>Kembalian</strong>
                    <strong style={{ fontSize: '16px', color: '#166534' }}>{formatter.format(Number(selectedTx.cashReturn || selectedTx.cashReceived - selectedTx.totalAmount))}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}
      </Modal>
    </div>
  );
};

export default TransactionListView;
