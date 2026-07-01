import React, { useState, useEffect, useMemo } from 'react';
import { Card, Col, Row, Statistic, Table, DatePicker, Button, Space, Tabs, Spin, Typography, Select, Input, Empty, message } from 'antd';
import { DownloadOutlined, PrinterOutlined, CalendarOutlined, LineChartOutlined, GiftOutlined, UserOutlined, ShopOutlined, InfoCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { useReportsPresenter } from './reports.presenter';
import { UsersService } from '../users/users.service';

const { RangePicker } = DatePicker;
const { Title, Paragraph, Text } = Typography;

export const ReportsView: React.FC = () => {
  const {
    loading,
    reportData,
    setStartDate,
    setEndDate,
    fetchReport,
    downloadCSV,
    downloadPDF,
  } = useReportsPresenter();

  const [hasSearched, setHasSearched] = useState(false);
  const [dates, setDates] = useState<[string, string] | null>(null);
  const [selectedCashier, setSelectedCashier] = useState<string | undefined>(undefined);
  const [keyword, setKeyword] = useState<string>('');
  const [cashiers, setCashiers] = useState<any[]>([]);

  // Fetch cashiers for the filter list
  useEffect(() => {
    async function loadCashiers() {
      try {
        const res = await UsersService.getAll();
        if (res.success) {
          setCashiers(res.data);
        }
      } catch (e) {
        console.error('Failed to load cashiers for report filters:', e);
      }
    }
    loadCashiers();
  }, []);

  const formatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  });

  const handleRangeChange = (val: any, dateStrings: [string, string]) => {
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
    setStartDate(dates[0]);
    setEndDate(dates[1]);
    fetchReport({ startDate: dates[0], endDate: dates[1] });
    setHasSearched(true);
  };

  const handleReset = () => {
    setDates(null);
    setSelectedCashier(undefined);
    setKeyword('');
    setHasSearched(false);
  };

  // Client-side filtering of cashier data and metrics
  const displayedMetrics = useMemo(() => {
    if (!reportData) return { totalSales: 0, transactionCount: 0, averageTransactionValue: 0, uniqueCustomersCount: 0 };
    
    if (selectedCashier) {
      const cashierData = reportData.salesByCashier.find(c => c.cashierId === selectedCashier);
      if (cashierData) {
        return {
          totalSales: cashierData.totalSales,
          transactionCount: cashierData.transactionCount,
          averageTransactionValue: cashierData.transactionCount > 0 ? cashierData.totalSales / cashierData.transactionCount : 0,
          uniqueCustomersCount: reportData.metrics.uniqueCustomersCount
        };
      }
      return { totalSales: 0, transactionCount: 0, averageTransactionValue: 0, uniqueCustomersCount: 0 };
    }
    return reportData.metrics;
  }, [reportData, selectedCashier]);

  const displayedCashierSales = useMemo(() => {
    if (!reportData) return [];
    let list = reportData.salesByCashier;

    if (selectedCashier) {
      list = list.filter(c => c.cashierId === selectedCashier);
    }
    if (keyword) {
      const kw = keyword.toLowerCase();
      list = list.filter(c => c.fullName.toLowerCase().includes(kw) || c.username.toLowerCase().includes(kw));
    }
    return list;
  }, [reportData, selectedCashier, keyword]);

  const displayedProducts = useMemo(() => {
    if (!reportData) return [];
    let list = reportData.topProducts;

    if (keyword) {
      const kw = keyword.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(kw) || p.sku.toLowerCase().includes(kw));
    }
    return list;
  }, [reportData, keyword]);

  // Columns for Tables
  const productColumns = [
    {
      title: 'Nama Produk',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      render: (text: string) => <code style={{ fontFamily: "'Source Code Pro', monospace" }}>{text}</code>,
    },
    {
      title: 'Kategori',
      dataIndex: 'categoryName',
      key: 'categoryName',
      render: (text: string) => (
        <span style={{
          background: '#FFFBF5',
          border: '1px solid #D6D3D1',
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          color: '#365314',
          fontWeight: 600,
        }}>
          {text}
        </span>
      ),
    },
    {
      title: 'Terjual',
      dataIndex: 'quantitySold',
      key: 'quantitySold',
      align: 'right' as const,
      sorter: (a: any, b: any) => a.quantitySold - b.quantitySold,
      render: (text: number) => <strong>{text} pcs</strong>,
    },
    {
      title: 'Total Pendapatan',
      dataIndex: 'totalRevenue',
      key: 'totalRevenue',
      align: 'right' as const,
      sorter: (a: any, b: any) => a.totalRevenue - b.totalRevenue,
      render: (val: number) => formatter.format(val),
    },
  ];

  const cashierColumns = [
    {
      title: 'Nama Lengkap',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text: string) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      render: (text: string) => <code style={{ fontFamily: "'Source Code Pro', monospace" }}>@{text}</code>,
    },
    {
      title: 'Total Transaksi',
      dataIndex: 'transactionCount',
      key: 'transactionCount',
      align: 'right' as const,
      sorter: (a: any, b: any) => a.transactionCount - b.transactionCount,
      render: (text: number) => <strong>{text} kali</strong>,
    },
    {
      title: 'Total Penjualan',
      dataIndex: 'totalSales',
      key: 'totalSales',
      align: 'right' as const,
      sorter: (a: any, b: any) => a.totalSales - b.totalSales,
      render: (val: number) => formatter.format(val),
    },
  ];

  const tabItems = [
    {
      key: 'products',
      label: <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>Produk Terlaris</span>,
      children: (
        <Table
          dataSource={displayedProducts}
          columns={productColumns}
          rowKey="productId"
          pagination={{ pageSize: 5 }}
          bordered={false}
          style={{ background: '#FFFFFF' }}
        />
      ),
    },
    {
      key: 'cashiers',
      label: <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>Kinerja Kasir</span>,
      children: (
        <Table
          dataSource={displayedCashierSales}
          columns={cashierColumns}
          rowKey="cashierId"
          pagination={{ pageSize: 5 }}
          bordered={false}
          style={{ background: '#FFFFFF' }}
        />
      ),
    },
  ];

  return (
    <div>
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <Title level={2} style={{ margin: 0, fontFamily: "'Inter', sans-serif", color: '#C2410C' }}>Laporan</Title>
          <Paragraph style={{ fontFamily: "'Inter', sans-serif", color: '#57534E', fontSize: '15px' }}>
            Tentukan kriteria filter pencarian untuk memuat dan mengekspor laporan transaksi kasir UMKM Anda.
          </Paragraph>
        </div>
      </div>

      {/* Main Content Card wrapping both filters and results */}
      <Card
        style={{
          border: '1px solid #E7E5E4',
          borderRadius: '8px',
          backgroundColor: '#FFFFFF',
        }}
        bodyStyle={{ padding: '24px' }}
      >
        {/* Complex Filter Toolbar */}
        <div style={{ marginBottom: '24px' }}>
          <Row gutter={[16, 16]} align="bottom">
            <Col xs={24} sm={12} md={7}>
              <div style={{ marginBottom: '8px', fontWeight: 600, color: '#1C1917' }}>
                <SearchOutlined /> Cari:
              </div>
              <Input
                placeholder="Cari nama produk, SKU, atau nama kasir..."
                style={{ width: '100%', height: '42px' }}
                onChange={(e) => setKeyword(e.target.value)}
                value={keyword}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div style={{ marginBottom: '8px', fontWeight: 600, color: '#1C1917' }}>
                <CalendarOutlined /> Rentang Waktu:
              </div>
              <RangePicker
                onChange={handleRangeChange}
                placeholder={['Mulai Tanggal', 'Selesai Tanggal']}
                style={{ borderColor: '#D6D3D1', width: '100%', height: '42px' }}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div style={{ marginBottom: '8px', fontWeight: 600, color: '#1C1917' }}>
                <UserOutlined /> Kasir:
              </div>
              <Select
                placeholder="Pilih Staf Kasir"
                allowClear
                style={{ width: '100%', height: '42px' }}
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
              <Space style={{ width: '100%' }}>
                <Button
                  type="primary"
                  onClick={handleSearch}
                  style={{
                    backgroundColor: '#C2410C',
                    borderColor: '#C2410C',
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 600,
                    borderRadius: '4px',
                    height: '42px',
                    width: '100%'
                  }}
                >
                  Cari
                </Button>
                <Button
                  type="default"
                  onClick={handleReset}
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    borderRadius: '4px',
                    height: '42px'
                  }}
                >
                  Reset
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        {/* Divider line separating filters and results */}
        <div style={{ height: '1px', background: '#E7E5E4', marginBottom: '24px' }} />

        <Spin spinning={loading}>
          {!hasSearched ? (
            <div style={{ padding: '60px 0', textAlign: 'center' }}>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span style={{ color: '#A8A29E', fontFamily: "'Inter', sans-serif" }}>
                    Silakan masukkan filter rentang waktu dan klik <strong>Cari</strong> untuk memuat data.
                  </span>
                }
              />
            </div>
          ) : (
            <div>
              {/* Export Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <Space>
                  <InfoCircleOutlined style={{ color: '#C2410C' }} />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    * Ekspor data mencakup seluruh transaksi dalam rentang tanggal yang dipilih.
                  </Text>
                </Space>
                <Space>
                  <Button
                    type="default"
                    icon={<DownloadOutlined />}
                    onClick={downloadCSV}
                    style={{
                      borderColor: '#C2410C',
                      color: '#C2410C',
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 600,
                      borderRadius: '4px',
                    }}
                  >
                    Ekspor Excel (CSV)
                  </Button>
                  <Button
                    type="primary"
                    icon={<PrinterOutlined />}
                    onClick={downloadPDF}
                    style={{
                      backgroundColor: '#C2410C',
                      borderColor: '#C2410C',
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 600,
                      borderRadius: '4px',
                    }}
                  >
                    Cetak PDF
                  </Button>
                </Space>
              </div>

              {/* Metrics Row (Borderless, side borders only) */}
              <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
                <Col xs={24} sm={12} lg={6} style={{ borderLeft: '4px solid #C2410C', paddingLeft: '16px' }}>
                  <Statistic
                    title={<span style={{ color: '#57534E', fontWeight: 600 }}>Total Pendapatan</span>}
                    value={displayedMetrics.totalSales}
                    formatter={(val) => formatter.format(val as number)}
                    valueStyle={{ color: '#C2410C', fontWeight: 'bold', fontSize: '22px' }}
                    prefix={<LineChartOutlined style={{ color: '#C2410C' }} />}
                  />
                </Col>
                <Col xs={24} sm={12} lg={6} style={{ borderLeft: '4px solid #365314', paddingLeft: '16px' }}>
                  <Statistic
                    title={<span style={{ color: '#57534E', fontWeight: 600 }}>Jumlah Transaksi</span>}
                    value={displayedMetrics.transactionCount}
                    valueStyle={{ color: '#365314', fontWeight: 'bold', fontSize: '22px' }}
                    prefix={<ShopOutlined style={{ color: '#365314' }} />}
                  />
                </Col>
                <Col xs={24} sm={12} lg={6} style={{ borderLeft: '4px solid #D4A373', paddingLeft: '16px' }}>
                  <Statistic
                    title={<span style={{ color: '#57534E', fontWeight: 600 }}>Rata-rata Transaksi</span>}
                    value={displayedMetrics.averageTransactionValue}
                    formatter={(val) => formatter.format(val as number)}
                    valueStyle={{ color: '#9A3412', fontWeight: 'bold', fontSize: '22px' }}
                    prefix={<GiftOutlined style={{ color: '#D4A373' }} />}
                  />
                </Col>
                <Col xs={24} sm={12} lg={6} style={{ borderLeft: '4px solid #57534E', paddingLeft: '16px' }}>
                  <Statistic
                    title={<span style={{ color: '#57534E', fontWeight: 600 }}>Pelanggan Unik (Member)</span>}
                    value={displayedMetrics.uniqueCustomersCount}
                    valueStyle={{ color: '#1C1917', fontWeight: 'bold', fontSize: '22px' }}
                    prefix={<UserOutlined style={{ color: '#57534E' }} />}
                  />
                </Col>
              </Row>

              {/* Divider line */}
              <div style={{ height: '1px', background: '#E7E5E4', marginBottom: '24px' }} />

              {/* Detailed Data Tabs */}
              <Tabs defaultActiveKey="products" items={tabItems} />
            </div>
          )}
        </Spin>
      </Card>
    </div>
  );
};
