import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, Typography, Spin, Table, Button, Tag, Space, Modal, Radio, InputNumber, Divider, message } from 'antd';
import { 
  ShoppingOutlined, 
  LineChartOutlined, 
  ShopOutlined,
  ClockCircleOutlined, 
  CoffeeOutlined, 
  CheckCircleOutlined, 
  EyeOutlined, 
  CreditCardOutlined
} from '@ant-design/icons';
import { useAuthStore } from '../../stores/auth.store';
import { useDashboardPresenter } from './dashboard.presenter';
import { ReportsCharts } from '../reports/reports-charts.component';
import { TopProductData } from '../reports/reports.types';
import { TransactionItem } from '../sales/sales.types';
import { formatPaymentMethod, formatOrderStatus } from '../../libs/format.lib';

const { Title, Paragraph, Text } = Typography;

export const DashboardView: React.FC = () => {
  const { user } = useAuthStore();
  const presenter = useDashboardPresenter();

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<TransactionItem | null>(null);

  const [payModalOpen, setPayModalOpen] = useState(false);
  const [payingTx, setPayingTx] = useState<TransactionItem | null>(null);
  const [payMethod, setPayMethod] = useState<'CASH' | 'QRIS' | 'DEBIT' | 'TRANSFER'>('CASH');
  const [payCashReceived, setPayCashReceived] = useState<number>(0);

  useEffect(() => {
    presenter.fetchDashboardData(user?.role || '');
  }, [user, presenter.fetchDashboardData]);

  const formatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  });

  const nextOrderStatus = (current: string): string | null => {
    const flow: Record<string, string> = {
      PENDING: 'PROCESSING',
      PROCESSING: 'COMPLETED',
    };
    return flow[current] || null;
  };

  const orderStatusLabel: Record<string, string> = {
    PENDING: 'Proses Pesanan',
    PROCESSING: 'Selesaikan Pesanan',
  };

  const orderStatusIcon: Record<string, React.ReactNode> = {
    PENDING: <CoffeeOutlined />,
    PROCESSING: <CheckCircleOutlined />,
  };

  const openPaymentModal = (tx: TransactionItem) => {
    setPayingTx(tx);
    setPayMethod('CASH');
    setPayCashReceived(0);
    setPayModalOpen(true);
  };

  const handleProcessPayment = async () => {
    if (!payingTx) return;
    const totalAmount = Number(payingTx.totalAmount);
    if (payMethod === 'CASH' && payCashReceived < totalAmount) {
      message.error('Uang diterima kurang dari total tagihan!');
      return;
    }

    const updatedTx = await presenter.handleProcessPayment(
      payingTx.id,
      {
        cashReceived: payMethod === 'CASH' ? payCashReceived : totalAmount,
        paymentMethod: payMethod,
      },
      user?.role || ''
    );

    if (updatedTx) {
      setPayModalOpen(false);
      setPayingTx(null);
      printReceipt(updatedTx);
    }
  };

  const printReceipt = (tx: TransactionItem) => {
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

    const itemsHtml = tx.items.map((item) => `
      <tr>
        <td style="padding: 4px 0; font-family: monospace; font-size: 13px;">
          ${item.product.name}<br/>
          <span style="font-size: 11px; color: #555;">${item.quantity} x ${formatter.format(Number(item.priceAtPurchase))}</span>
        </td>
        <td style="text-align: right; padding: 4px 0; font-family: monospace; font-size: 13px; vertical-align: bottom;">
          ${formatter.format(Number(item.quantity) * Number(item.priceAtPurchase))}
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
            <h3 style="margin: 0; font-size: 16px;">${presenter.storeSetting?.storeName || 'Kantin Nusantara'}</h3>
            <p style="margin: 4px 0; font-size: 11px;">${presenter.storeSetting?.address || ''}</p>
            <p style="margin: 4px 0; font-size: 11px;">Telp: ${presenter.storeSetting?.phone || ''}</p>
          </div>
          <div class="divider"></div>
          <div style="font-size: 11px; line-height: 1.4;">
            <strong>No:</strong> ${tx.transactionCode}<br/>
            <strong>Tgl:</strong> ${dateStr}<br/>
            <strong>Kasir:</strong> ${tx.cashier?.fullName || 'System'}<br/>
            <strong>Pelanggan:</strong> ${tx.customerName || 'Tamu'}<br/>
            <strong>Pembayaran:</strong> ${formatPaymentMethod(tx.paymentMethod)}<br/>
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
            ${tx.paymentMethod === 'CASH' ? `
            <tr>
              <td>Uang Diterima</td>
              <td style="text-align: right;">${formatter.format(Number(tx.cashReceived))}</td>
            </tr>
            <tr>
              <td>Kembalian</td>
              <td style="text-align: right;">${formatter.format(Number(tx.cashReturn || Number(tx.cashReceived) - Number(tx.totalAmount)))}</td>
            </tr>
            ` : ''}
          </table>
          <div class="divider"></div>
          <div class="text-center" style="font-size: 11px; margin-top: 15px;">
            Terima Kasih atas Kunjungan Anda!<br/>
            POS UMKM Premium
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const showDetail = (tx: TransactionItem) => {
    setSelectedTx(tx);
    setDetailModalOpen(true);
  };

  const topProductColumns = [
    {
      title: 'Nama Produk',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <span className="text-semibold">{text}</span>,
    },
    {
      title: 'Kategori',
      dataIndex: 'categoryName',
      key: 'categoryName',
      render: (text: string) => <span className="badge-category">{text}</span>,
    },
    {
      title: 'Terjual',
      dataIndex: 'quantitySold',
      key: 'quantitySold',
      align: 'right' as const,
      render: (text: number) => <strong>{text} pcs</strong>,
    },
  ];

  const topTableColumns = [
    {
      title: 'Kode Meja',
      dataIndex: 'tableCode',
      key: 'tableCode',
      render: (text: string) => <span className="text-semibold">{text}</span>,
    },
    {
      title: 'Nama Meja',
      dataIndex: 'tableNumber',
      key: 'tableNumber',
      render: (text: string) => <span className="text-semibold">{text}</span>,
    },
    {
      title: 'Frekuensi',
      dataIndex: 'useCount',
      key: 'useCount',
      align: 'right' as const,
      render: (text: number) => <strong>{text} kali</strong>,
    },
  ];

  const incomingOrderColumns = [
    {
      title: 'Kode',
      dataIndex: 'transactionCode',
      key: 'transactionCode',
      render: (text: string) => <span className="text-primary-color text-semibold">{text}</span>,
    },
    {
      title: 'Tanggal & Waktu',
      dataIndex: 'transactionDate',
      key: 'transactionDate',
      render: (dateStr: string) => new Date(dateStr).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
    },
    {
      title: 'Nomor Meja',
      key: 'tableCode',
      render: (_: unknown, record: TransactionItem) => (
        record.table?.code ? (
          <span className="text-tertiary-color text-semibold">{record.table.code}</span>
        ) : (
          <Text type="secondary">-</Text>
        )
      ),
    },
    {
      title: 'Pelanggan',
      dataIndex: 'customerName',
      key: 'customerName',
      render: (text: string | null) => text || <Text type="secondary">Pelanggan Umum</Text>,
    },
    {
      title: 'Total Belanja',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      align: 'right' as const,
      render: (val: number) => <strong>{formatter.format(Number(val))}</strong>,
    },
    {
      title: 'Status Pesanan',
      dataIndex: 'orderStatus',
      key: 'orderStatus',
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          PENDING: 'orange',
          PROCESSING: 'blue',
          COMPLETED: 'default',
        };
        return <Tag color={colorMap[status] || 'default'}>{formatOrderStatus(status)}</Tag>;
      },
    },
    {
      title: 'Pembayaran',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: (status: string) => (
        status === 'PAID'
          ? <Tag color="success" className="tag-status">LUNAS</Tag>
          : <Tag color="warning" className="tag-status">BELUM BAYAR</Tag>
      ),
    },
    {
      title: 'Aksi',
      key: 'quick_action',
      align: 'center' as const,
      render: (_: unknown, record: TransactionItem) => (
        <Button 
          size="small"
          icon={<EyeOutlined />}
          onClick={() => showDetail(record)}
          className="btn-secondary-default"
        >
          Detail
        </Button>
      )
    }
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <Title level={2} className="page-title">Dashboard POS</Title>
          <Paragraph className="page-subtitle">
            Selamat datang kembali, {user?.fullName} ({user?.role === 'ADMIN' ? 'Administrator' : 'Kasir'}). Berikut ringkasan dan monitoring operasional toko Anda hari ini.
          </Paragraph>
        </div>
      </div>

      <Spin spinning={presenter.loading || presenter.incomingOrdersLoading}>
        {/* SECTION 1: MONITORING METRICS HARI INI */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card bordered className="card-stat card-stat-warning">
              <Statistic
                title={<span className="metric-title">Pesanan Menunggu</span>}
                value={presenter.metrics?.pendingOrdersCount || 0}
                suffix="pesanan"
                valueStyle={{ color: 'var(--color-warning)', fontWeight: 'bold' }}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card bordered className="card-stat card-stat-info">
              <Statistic
                title={<span className="metric-title">Sedang Diproses</span>}
                value={presenter.metrics?.processingOrdersCount || 0}
                suffix="pesanan"
                valueStyle={{ color: 'var(--color-info)', fontWeight: 'bold' }}
                prefix={<CoffeeOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card bordered className="card-stat card-stat-success">
              <Statistic
                title={<span className="metric-title">Selesai Hari Ini</span>}
                value={presenter.metrics?.completedOrdersCount || 0}
                suffix="pesanan"
                valueStyle={{ color: 'var(--color-success)', fontWeight: 'bold' }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card bordered className="card-stat card-stat-primary">
              <Statistic
                title={<span className="metric-title">Pendapatan Hari Ini</span>}
                value={presenter.metrics?.revenueToday || 0}
                formatter={(val) => formatter.format(val as number)}
                valueStyle={{ color: '#C2410C', fontWeight: 'bold' }}
                prefix={<LineChartOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* SECTION 2: PESANAN MASUK (INCOMING ORDERS) */}
        <div className="section-spacing">
          <Card 
            title={
              <Space>
                <ShoppingOutlined className="text-primary-color" />
                <span>Pesanan Masuk Aktif</span>
              </Space>
            }
            className="card-full-height"
          >
            <Table
              dataSource={presenter.incomingOrders}
              columns={incomingOrderColumns}
              rowKey="id"
              pagination={false}
              size="middle"
              locale={{ emptyText: 'Tidak ada pesanan masuk yang perlu diproses saat ini.' }}
            />
          </Card>
        </div>

        {/* SECTION 3: GRAFIK & ANALISIS (ADMIN ONLY) */}
        {user?.role === 'ADMIN' && (
          <div className="section-spacing">
            <Divider orientation="left">Analisis & Performa Penjualan</Divider>
            
            <div className="section-spacing">
              <ReportsCharts
                salesData={presenter.reportData?.salesOverTime || []}
                topProducts={presenter.reportData?.topProducts || []}
              />
            </div>

            <Row gutter={[16, 16]} className="section-spacing">
              <Col xs={24} md={12}>
                <Card className="card-full-height" title={<span><ShoppingOutlined className="text-primary-color" /> 5 Produk Terlaris</span>}>
                  <Table
                    dataSource={presenter.reportData?.topProducts.slice(0, 5) || []}
                    columns={topProductColumns}
                    rowKey={(record: TopProductData) => record.productId}
                    pagination={false}
                    size="small"
                  />
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card className="card-full-height" title={<span><ShopOutlined className="text-tertiary-color" /> 5 Meja Terfavorit Bulan Ini</span>}>
                  <Table
                    dataSource={presenter.reportData?.topTables || []}
                    columns={topTableColumns}
                    rowKey="tableId"
                    pagination={false}
                    size="small"
                    locale={{ emptyText: 'Belum ada transaksi meja bulan ini.' }}
                  />
                </Card>
              </Col>
            </Row>
          </div>
        )}
      </Spin>

      {/* DETAIL MODAL */}
      <Modal
        title="Detail Penjualan"
        open={detailModalOpen}
        onCancel={() => {
          setDetailModalOpen(false);
          setSelectedTx(null);
        }}
        footer={
          <div className="detail-modal-footer">
            <Button
              key="close"
              className="btn-secondary-default"
              onClick={() => {
                setDetailModalOpen(false);
                setSelectedTx(null);
              }}
            >
              Tutup
            </Button>
            <Space>
              {selectedTx && nextOrderStatus(selectedTx.orderStatus) && (
                <Button
                  key="status-update"
                  type="primary"
                  icon={orderStatusIcon[selectedTx.orderStatus]}
                  onClick={async () => {
                    const nextStatus = nextOrderStatus(selectedTx.orderStatus)!;
                    const updated = await presenter.handleUpdateOrderStatus(selectedTx.id, nextStatus, user?.role || '');
                    if (updated) {
                      setSelectedTx(updated);
                      if (nextStatus === 'PROCESSING') {
                        printReceipt(updated);
                        setDetailModalOpen(false);
                        setSelectedTx(null);
                      }
                    }
                  }}
                  className="btn-primary-terracotta"
                >
                  {orderStatusLabel[selectedTx.orderStatus]}
                </Button>
              )}
              {selectedTx && selectedTx.orderStatus === 'COMPLETED' && selectedTx.paymentStatus === 'UNPAID' && (
                <Button
                  key="payment"
                  type="primary"
                  icon={<CreditCardOutlined />}
                  onClick={() => {
                    openPaymentModal(selectedTx);
                    setDetailModalOpen(false);
                  }}
                  className="btn-primary-terracotta"
                >
                  Proses Pembayaran
                </Button>
              )}
            </Space>
          </div>
        }
        width={750}
        destroyOnClose
      >
        {selectedTx && (
          <div className="modal-detail-content">
            <div className="detail-meta-grid">
              <div>
                <div className="detail-field">
                  <span className="detail-label">Kode Transaksi</span>
                  <span className="detail-value">{selectedTx.transactionCode}</span>
                </div>
                <div className="detail-field">
                  <span className="detail-label">Waktu Transaksi</span>
                  <span className="detail-value">
                    {new Date(selectedTx.transactionDate).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>
                <div className="detail-field">
                  <span className="detail-label">Metode Pembayaran</span>
                  <span className="detail-value">
                    {formatPaymentMethod(selectedTx.paymentMethod)}
                  </span>
                </div>
                <div className="detail-field">
                  <span className="detail-label">Status Pesanan</span>
                  <span className="detail-value">
                    {formatOrderStatus(selectedTx.orderStatus)}
                  </span>
                </div>
              </div>
              <div>
                <div className="detail-field">
                  <span className="detail-label">Kasir yang Bertugas</span>
                  <span className="detail-value text-semibold">{selectedTx.cashier?.fullName || 'System'}</span>
                </div>
                <div className="detail-field">
                  <span className="detail-label">Pelanggan</span>
                  <span className="detail-value text-semibold">{selectedTx.customerName || 'Tamu'}</span>
                </div>
                {selectedTx.tableNumber && (
                  <div className="detail-field">
                    <span className="detail-label">Nomor Meja</span>
                    <span className="detail-value">
                      {selectedTx.table
                        ? `${selectedTx.table.number} - ${selectedTx.table.code}`
                        : selectedTx.tableNumber}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <Table
              dataSource={selectedTx.items}
              rowKey="id"
              pagination={false}
              size="small"
              columns={[
                {
                  title: 'Produk',
                  key: 'product',
                  render: (_: unknown, item: any) => (
                    <div>
                      <strong>{item.product.name}</strong>
                      <span className="detail-field-hint">{item.product.sku}</span>
                    </div>
                  )
                },
                {
                  title: 'Harga Satuan',
                  dataIndex: 'priceAtPurchase',
                  key: 'priceAtPurchase',
                  align: 'right' as const,
                  render: (val: number) => formatter.format(Number(val))
                },
                {
                  title: 'Jumlah (Qty)',
                  dataIndex: 'quantity',
                  key: 'quantity',
                  align: 'center' as const,
                  render: (val: number) => <strong>{val}</strong>
                },
                {
                  title: 'Subtotal',
                  key: 'subtotal',
                  align: 'right' as const,
                  render: (_: unknown, item: any) => (
                    <strong>{formatter.format(Number(item.subtotal))}</strong>
                  )
                }
              ]}
            />

            <div className="detail-total-panel">
              <div className="detail-total-row">
                <Text>Total Tagihan</Text>
                <strong className="text-primary-color">{formatter.format(Number(selectedTx.totalAmount))}</strong>
              </div>
              <div className="detail-total-row">
                <Text>Uang Diterima</Text>
                <span className="text-semibold">{formatter.format(Number(selectedTx.cashReceived))}</span>
              </div>
              <div className="detail-total-divider" />
              <div className="detail-total-row">
                <strong>Kembalian</strong>
                <strong className="text-success-color">{formatter.format(Number(selectedTx.cashReturn || Number(selectedTx.cashReceived) - Number(selectedTx.totalAmount)))}</strong>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* PAYMENT PROCESS MODAL */}
      <Modal
        title="Proses Pembayaran"
        open={payModalOpen}
        onCancel={() => { setPayModalOpen(false); setPayingTx(null); }}
        footer={[
          <Button key="close" className="btn-secondary-default" onClick={() => { setPayModalOpen(false); setPayingTx(null); }}>
            Batal
          </Button>,
          <Button key="submit" type="primary" loading={presenter.incomingOrdersLoading} onClick={handleProcessPayment} className="btn-primary-terracotta"
            disabled={payMethod === 'CASH' && payCashReceived < (payingTx ? Number(payingTx.totalAmount) : 0)}>
            Bayar & Cetak Struk
          </Button>,
        ]}
        width={420}
        destroyOnClose
      >
        {payingTx && (
          <div className="payment-modal-content">
            <div className="payment-summary-card">
              <div className="payment-summary-row">
                <Text type="secondary">Kode Transaksi:</Text>
                <strong className="font-mono">{payingTx.transactionCode}</strong>
              </div>
              <div className="payment-summary-row">
                <Text type="secondary">Meja / Pelanggan:</Text>
                <strong>{payingTx.tableNumber ? `${payingTx.tableNumber} (${payingTx.customerName || 'Tamu'})` : (payingTx.customerName || 'Tamu')}</strong>
              </div>
              <div className="payment-summary-total">
                <Text strong>Total Tagihan:</Text>
                <Text strong className="text-primary-color text-lg">{formatter.format(Number(payingTx.totalAmount))}</Text>
              </div>
            </div>

            <div className="payment-method-section">
              <Text className="payment-label">Metode Pembayaran</Text>
              <Radio.Group
                value={payMethod}
                onChange={(e) => {
                  const method = e.target.value;
                  setPayMethod(method);
                  if (method === 'CASH') {
                    setPayCashReceived(0);
                  } else {
                    setPayCashReceived(Number(payingTx.totalAmount));
                  }
                }}
                optionType="button"
                buttonStyle="solid"
                className="payment-radio-group"
              >
                <Radio.Button value="CASH" className="payment-radio-btn">TUNAI</Radio.Button>
                <Radio.Button value="QRIS" className="payment-radio-btn">QRIS</Radio.Button>
                <Radio.Button value="DEBIT" className="payment-radio-btn">DEBIT</Radio.Button>
                <Radio.Button value="TRANSFER" className="payment-radio-btn">TRANSFER</Radio.Button>
              </Radio.Group>
            </div>

            {payMethod === 'CASH' && (
              <div className="payment-cash-section">
                <Text className="payment-label">Uang Diterima</Text>
                <InputNumber
                  className="payment-cash-input"
                  min={0}
                  value={payCashReceived}
                  onChange={(val) => setPayCashReceived(val || 0)}
                  formatter={(value) => `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => parseFloat(value!.replace(/Rp\s?|(,*)/g, ''))}
                  placeholder="Masukkan uang tunai"
                />

                {payCashReceived >= Number(payingTx.totalAmount) && (
                  <div className="payment-change-card">
                    <Text className="text-success-color text-semibold">Kembalian</Text>
                    <strong className="text-success-color">{formatter.format(payCashReceived - Number(payingTx.totalAmount))}</strong>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
