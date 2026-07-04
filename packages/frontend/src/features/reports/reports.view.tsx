import React, { useState, useEffect, useMemo } from 'react';
import { Card, Col, Row, Statistic, Table, DatePicker, Button, Space, Tabs, Spin, Typography, Select, Input, Empty, message } from 'antd';
import { DownloadOutlined, PrinterOutlined, CalendarOutlined, LineChartOutlined, GiftOutlined, UserOutlined, ShopOutlined, InfoCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { useReportsPresenter } from './reports.presenter';
import { UsersPresenter } from '../users/users.presenter';
import { SalesByCashierData, TopProductData } from './reports.types';
import { createClientPagination } from '../../libs/pagination.lib';


const { RangePicker } = DatePicker;
const { Title, Paragraph, Text } = Typography;

export const ReportsView: React.FC = () => {
  const presenter = useReportsPresenter();

  const usersPresenter = new UsersPresenter();

  const [hasSearched, setHasSearched] = useState(false);
  const [dates, setDates] = useState<[string, string] | null>(null);
  const [selectedCashier, setSelectedCashier] = useState<string | undefined>(undefined);
  const [keyword, setKeyword] = useState<string>('');
  const [cashiers, setCashiers] = useState<{ id: string; fullName: string; username: string }[]>([]);

  useEffect(() => {
    async function loadCashiers() {
      try {
        const data = await usersPresenter.getAllUsers();
        setCashiers(data);
      } catch {
        message.error('Gagal memuat data kasir');
      }
    }
    loadCashiers();
  }, []);

  const formatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  });

  const handleRangeChange = (val: unknown, dateStrings: [string, string]) => {
    if (val) {
      setDates(dateStrings);
    } else {
      setDates(null);
    }
  };

  const handleSearch = () => {
    if (!dates || !dates[0] || !dates[1]) {
      message.warning('Silakan pilih rentang tanggal laporan terlebih dahulu!');
      return;
    }
    presenter.setStartDate(dates[0]);
    presenter.setEndDate(dates[1]);
    presenter.fetchReport({ startDate: dates[0], endDate: dates[1] });
    setHasSearched(true);
  };

  const handleReset = () => {
    setDates(null);
    setSelectedCashier(undefined);
    setKeyword('');
    setHasSearched(false);
  };

  const displayedMetrics = useMemo(() => {
    if (!presenter.reportData) return { totalSales: 0, transactionCount: 0, averageTransactionValue: 0, uniqueCustomersCount: 0 };

    if (selectedCashier) {
      const cashierData = presenter.reportData.salesByCashier.find(c => c.cashierId === selectedCashier);
      if (cashierData) {
        return {
          totalSales: cashierData.totalSales,
          transactionCount: cashierData.transactionCount,
          averageTransactionValue: cashierData.transactionCount > 0 ? cashierData.totalSales / cashierData.transactionCount : 0,
          uniqueCustomersCount: presenter.reportData.metrics.uniqueCustomersCount
        };
      }
      return { totalSales: 0, transactionCount: 0, averageTransactionValue: 0, uniqueCustomersCount: 0 };
    }
    return presenter.reportData.metrics;
  }, [presenter.reportData, selectedCashier]);

  const displayedCashierSales = useMemo(() => {
    if (!presenter.reportData) return [];
    let list = presenter.reportData.salesByCashier;

    if (selectedCashier) {
      list = list.filter(c => c.cashierId === selectedCashier);
    }
    if (keyword) {
      const kw = keyword.toLowerCase();
      list = list.filter(c => c.fullName.toLowerCase().includes(kw) || c.username.toLowerCase().includes(kw));
    }
    return list;
  }, [presenter.reportData, selectedCashier, keyword]);

  const displayedProducts = useMemo(() => {
    if (!presenter.reportData) return [];
    let list = presenter.reportData.topProducts;

    if (keyword) {
      const kw = keyword.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(kw) || p.sku.toLowerCase().includes(kw));
    }
    return list;
  }, [presenter.reportData, keyword]);

  const productColumns = [
    {
      title: 'Nama Produk',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <span className="text-semibold">{text}</span>,
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
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
      sorter: (a: TopProductData, b: TopProductData) => a.quantitySold - b.quantitySold,
      render: (text: number) => <strong>{text} pcs</strong>,
    },
    {
      title: 'Total Pendapatan',
      dataIndex: 'totalRevenue',
      key: 'totalRevenue',
      align: 'right' as const,
      sorter: (a: TopProductData, b: TopProductData) => a.totalRevenue - b.totalRevenue,
      render: (val: number) => formatter.format(val),
    },
  ];

  const cashierColumns = [
    {
      title: 'Nama Lengkap',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text: string) => <span className="text-semibold">{text}</span>,
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      render: (text: string) => <span>@{text}</span>,
    },
    {
      title: 'Total Transaksi',
      dataIndex: 'transactionCount',
      key: 'transactionCount',
      align: 'right' as const,
      sorter: (a: SalesByCashierData, b: SalesByCashierData) => a.transactionCount - b.transactionCount,
      render: (text: number) => <strong>{text} kali</strong>,
    },
    {
      title: 'Total Penjualan',
      dataIndex: 'totalSales',
      key: 'totalSales',
      align: 'right' as const,
      sorter: (a: SalesByCashierData, b: SalesByCashierData) => a.totalSales - b.totalSales,
      render: (val: number) => formatter.format(val),
    },
  ];

  const tabItems = [
    {
      key: 'products',
      label: <span className="text-semibold">Produk Terlaris</span>,
      children: (
        <Table
          dataSource={displayedProducts}
          columns={productColumns}
          rowKey="productId"
          pagination={createClientPagination(5)}
        />
      ),
    },
    {
      key: 'cashiers',
      label: <span className="text-semibold">Kinerja Kasir</span>,
      children: (
        <Table
          dataSource={displayedCashierSales}
          columns={cashierColumns}
          rowKey="cashierId"
          pagination={createClientPagination(5)}
        />
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <Title level={2} className="page-title">Laporan</Title>
          <Paragraph className="page-subtitle">
            Tentukan kriteria filter pencarian untuk memuat dan mengekspor laporan transaksi kasir UMKM Anda.
          </Paragraph>
        </div>
      </div>

      <Card className="card-filter">
        <div className="filter-toolbar">
          <Row gutter={[16, 16]} align="bottom">
            <Col xs={24} sm={12} md={7}>
              <div className="filter-label"><SearchOutlined /> Cari:</div>
              <Input
                placeholder="Cari nama produk, SKU, atau nama kasir..."
                onChange={(e) => setKeyword(e.target.value)}
                value={keyword}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div className="filter-label"><CalendarOutlined /> Rentang Waktu:</div>
              <RangePicker
                onChange={handleRangeChange}
                placeholder={['Mulai Tanggal', 'Selesai Tanggal']}
                className="w-full"
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div className="filter-label"><UserOutlined /> Kasir:</div>
              <Select
                placeholder="Pilih Staf Kasir"
                allowClear
                className="w-full"
                onChange={(val) => setSelectedCashier(val)}
                value={selectedCashier}
              >
                {cashiers.map((user) => (
                  <Select.Option key={user.id} value={user.id}>
                    {user.fullName} (@{user.username})
                  </Select.Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} md={5}>
              <Space className="w-full">
                <Button type="primary" onClick={handleSearch} className="btn-primary-terracotta w-full">
                  Cari
                </Button>
                <Button type="default" onClick={handleReset}>
                  Reset
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        <div className="divider-horizontal" />

        <Spin spinning={presenter.loading}>
          {!hasSearched ? (
            <div className="empty-state">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={<span className="text-secondary-muted">Silakan masukkan filter rentang waktu dan klik <strong>Cari</strong> untuk memuat data.</span>}
              />
            </div>
          ) : (
            <div>
              <div className="export-actions">
                <Space>
                  <InfoCircleOutlined className="text-primary-color" />
                  <Text type="secondary" className="caption-text">
                    * Ekspor data mencakup seluruh transaksi dalam rentang tanggal yang dipilih.
                  </Text>
                </Space>
                <Space>
                  <Button icon={<DownloadOutlined />} onClick={presenter.downloadCSV} className="btn-secondary-outline">
                    Ekspor Excel (CSV)
                  </Button>
                  <Button type="primary" icon={<PrinterOutlined />} onClick={presenter.downloadPDF} className="btn-primary-terracotta">
                    Cetak PDF
                  </Button>
                </Space>
              </div>

              <Row gutter={[24, 24]} className="metrics-row">
                <Col xs={24} sm={12} lg={6} className="metric-col metric-col-primary">
                  <Statistic
                    title={<span className="metric-title">Total Pendapatan</span>}
                    value={displayedMetrics.totalSales}
                    formatter={(val) => formatter.format(val as number)}
                    valueStyle={{ color: '#C2410C', fontWeight: 'bold', fontSize: '22px' }}
                    prefix={<LineChartOutlined />}
                  />
                </Col>
                <Col xs={24} sm={12} lg={6} className="metric-col metric-col-tertiary">
                  <Statistic
                    title={<span className="metric-title">Jumlah Transaksi</span>}
                    value={displayedMetrics.transactionCount}
                    valueStyle={{ color: '#365314', fontWeight: 'bold', fontSize: '22px' }}
                    prefix={<ShopOutlined />}
                  />
                </Col>
                <Col xs={24} sm={12} lg={6} className="metric-col metric-col-secondary">
                  <Statistic
                    title={<span className="metric-title">Rata-rata Transaksi</span>}
                    value={displayedMetrics.averageTransactionValue}
                    formatter={(val) => formatter.format(val as number)}
                    valueStyle={{ color: '#9A3412', fontWeight: 'bold', fontSize: '22px' }}
                    prefix={<GiftOutlined />}
                  />
                </Col>
                <Col xs={24} sm={12} lg={6} className="metric-col metric-col-neutral">
                  <Statistic
                    title={<span className="metric-title">Pelanggan Unik (Member)</span>}
                    value={displayedMetrics.uniqueCustomersCount}
                    valueStyle={{ color: '#1C1917', fontWeight: 'bold', fontSize: '22px' }}
                    prefix={<UserOutlined />}
                  />
                </Col>
              </Row>

              <div className="divider-horizontal" />

              <Tabs defaultActiveKey="products" items={tabItems} />
            </div>
          )}
        </Spin>
      </Card>
    </div>
  );
};
