import React, { useEffect, useState } from 'react';
import { Table, Button, Input, DatePicker, Space, Typography, Modal, Card, message, Dropdown, Tag, Radio, InputNumber } from 'antd';
import { SearchOutlined, PrinterOutlined, CalendarOutlined, EyeOutlined, MoreOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { useSalesPresenter } from './sales.presenter';
import { SalesService } from './sales.service';
import { SettingsService } from '../settings/settings.service';
import { AxiosError } from 'axios';
import { TransactionItem } from './sales.types';
import { createServerPagination } from '../../libs/pagination.lib';

const { Title, Paragraph, Text } = Typography;
const { RangePicker } = DatePicker;

interface StoreSettingData {
  storeName?: string;
  address?: string;
  phone?: string;
}

export const TransactionListView: React.FC = () => {
  const presenter = useSalesPresenter();

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<TransactionItem | null>(null);
  const [storeSetting, setStoreSetting] = useState<StoreSettingData | null>(null);

  const [payModalOpen, setPayModalOpen] = useState(false);
  const [payingTx, setPayingTx] = useState<TransactionItem | null>(null);
  const [payMethod, setPayMethod] = useState<'CASH' | 'QRIS' | 'DEBIT' | 'TRANSFER'>('CASH');
  const [payCashReceived, setPayCashReceived] = useState<number>(0);
  const [payLoading, setPayLoading] = useState(false);

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

    setPayLoading(true);
    try {
      const res = await SalesService.payPendingTransaction(payingTx.id, {
        cashReceived: payMethod === 'CASH' ? payCashReceived : totalAmount,
        paymentMethod: payMethod,
      });

      if (res.success && res.data) {
        message.success('Pembayaran berhasil diproses!');
        setPayModalOpen(false);
        setPayingTx(null);
        presenter.fetchTransactions();
        printReceipt(res.data.transaction);
      } else {
        message.error(res.message || 'Gagal memproses pembayaran');
      }
    } catch (err: unknown) {
      const msg = err instanceof AxiosError ? err.response?.data?.message : 'Error memproses pembayaran';
      message.error(msg);
    } finally {
      setPayLoading(false);
    }
  };

  useEffect(() => {
    presenter.fetchTransactions();
    const loadSettings = async () => {
      try {
        const res = await SettingsService.getStoreSetting();
        if (res.success) {
          setStoreSetting(res.data);
        }
      } catch {
        // Store settings not available
      }
    };
    loadSettings();
  }, []);

  const formatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  });

  const handleRangeChange = (dates: unknown, dateStrings: [string, string]) => {
    if (dates) {
      presenter.handleDateFilter(dateStrings[0], dateStrings[1]);
    } else {
      presenter.handleDateFilter(undefined, undefined);
    }
  };

  const showDetail = (tx: TransactionItem) => {
    setSelectedTx(tx);
    setDetailModalOpen(true);
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
            <strong>Pembayaran:</strong> ${tx.paymentMethod}<br/>
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

  const columns = [
    {
      title: 'Kode Transaksi',
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
      title: 'Kasir',
      dataIndex: 'cashier',
      key: 'cashier',
      render: (cashier: { fullName: string } | null) => cashier?.fullName || 'System',
    },
    {
      title: 'Pelanggan',
      dataIndex: 'customerName',
      key: 'customerName',
      render: (text: string | null) => text || <Text type="secondary">Pelanggan Umum</Text>,
    },
    {
      title: 'Nomor Meja',
      dataIndex: 'table',
      key: 'table',
      render: (table: { code: string } | null) => (
        table?.code ? <span className="text-tertiary-color text-semibold">{table.code}</span> : <Text type="secondary">-</Text>
      ),
    },
    {
      title: 'Total Belanja',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      align: 'right' as const,
      render: (val: number) => <strong>{formatter.format(Number(val))}</strong>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        status === 'PENDING'
          ? <Tag color="warning" className="tag-status">BELUM BAYAR</Tag>
          : <Tag color="success" className="tag-status">LUNAS</Tag>
      ),
    },
    {
      title: 'Aksi',
      key: 'actions',
      width: 100,
      align: 'center' as const,
      render: (_: unknown, record: TransactionItem) => {
        const actionMenu = {
          items: [
            {
              key: 'detail',
              label: 'Detail',
              icon: <EyeOutlined />,
              onClick: () => showDetail(record)
            },
            ...(record.status === 'PENDING' ? [
              {
                key: 'pay',
                label: 'Proses Pembayaran',
                icon: <ShoppingCartOutlined />,
                onClick: () => openPaymentModal(record)
              }
            ] : []),
            {
              key: 'print',
              label: 'Cetak Struk',
              icon: <PrinterOutlined />,
              onClick: () => printReceipt(record)
            }
          ]
        };

        return (
          <Dropdown menu={actionMenu} trigger={['click']} placement="bottomRight">
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        );
      }
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <Title level={2} className="page-title">Penjualan</Title>
          <Paragraph className="page-subtitle">
            Lihat, cari, dan tinjau seluruh transaksi penjualan sebelumnya serta cetak struk.
          </Paragraph>
        </div>
      </div>

      <Card className="card-filter">
        <div className="filter-toolbar">
          <Space wrap className="w-full" style={{ justifyContent: 'space-between' }}>
            <Input.Search
              placeholder="Cari berdasarkan Kode atau Nama Pelanggan..."
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={presenter.handleSearch}
              style={{ width: 320 }}
            />

            <Space wrap>
              <span className="filter-label-inline">
                <CalendarOutlined /> Filter Tanggal:
              </span>
              <RangePicker
                onChange={handleRangeChange}
                placeholder={['Tanggal Mulai', 'Tanggal Selesai']}
              />
            </Space>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={presenter.transactions}
          rowKey="id"
          loading={presenter.loading}
          pagination={createServerPagination({
            current: presenter.query.page,
            pageSize: presenter.query.limit,
            total: presenter.total,
            onChange: presenter.handlePageChange,
          })}
        />
      </Card>

      <Modal
        title="Detail Penjualan"
        open={detailModalOpen}
        onCancel={() => {
          setDetailModalOpen(false);
          setSelectedTx(null);
        }}
        footer={[
          <Button key="close" onClick={() => { setDetailModalOpen(false); setSelectedTx(null); }}>
            Tutup
          </Button>,
          <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={() => selectedTx && printReceipt(selectedTx)} className="btn-primary-terracotta" disabled={!selectedTx}>
            Cetak Struk
          </Button>,
        ]}
        width={750}
        destroyOnClose
      >
        {selectedTx && (
          <div className="modal-detail-content">
            <div className="detail-meta-grid">
              <div>
                <div className="detail-field">
                  <span className="detail-label">Kode Transaksi</span>
                  <strong className="detail-value-mono">{selectedTx.transactionCode}</strong>
                </div>
                <div className="detail-field">
                  <span className="detail-label">Waktu Transaksi</span>
                  <span className="detail-value">
                    {new Date(selectedTx.transactionDate).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>
                <div className="detail-field">
                  <span className="detail-label">Metode Pembayaran</span>
                  <span className={`payment-badge payment-badge-${selectedTx.paymentMethod === 'CASH' ? 'cash' : 'non-cash'}`}>
                    {selectedTx.paymentMethod}
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
                    <span className="detail-value text-primary-color text-semibold">
                      {selectedTx.tableNumber}
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
                  render: (_: unknown, item: TransactionItem['items'][0]) => (
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
                  render: (_: unknown, item: TransactionItem['items'][0]) => (
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

      <Modal
        title="Proses Pembayaran"
        open={payModalOpen}
        onCancel={() => { setPayModalOpen(false); setPayingTx(null); }}
        footer={[
          <Button key="close" onClick={() => { setPayModalOpen(false); setPayingTx(null); }}>
            Batal
          </Button>,
          <Button key="submit" type="primary" loading={payLoading} onClick={handleProcessPayment} className="btn-primary-terracotta"
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
                  if (method === 'QRIS') {
                    setPayCashReceived(Number(payingTx.totalAmount));
                  } else {
                    setPayCashReceived(0);
                  }
                }}
                optionType="button"
                buttonStyle="solid"
                className="payment-radio-group"
              >
                <Radio.Button value="CASH" className="payment-radio-btn">TUNAI</Radio.Button>
                <Radio.Button value="QRIS" className="payment-radio-btn">QRIS</Radio.Button>
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
