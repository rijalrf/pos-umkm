import React from 'react';
import { Card, Col, Row, Statistic, Table, DatePicker, Button, Space, Tabs, Spin, Typography } from 'antd';
import { DownloadOutlined, PrinterOutlined, CalendarOutlined, LineChartOutlined, GiftOutlined, UserOutlined, ShopOutlined } from '@ant-design/icons';
import { useReportsPresenter } from './reports.presenter';
import { ReportsCharts } from './reports-charts.component';

const { RangePicker } = DatePicker;
const { Title, Paragraph } = Typography;

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

  const formatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  });

  const handleRangeChange = (dates: any, dateStrings: [string, string]) => {
    if (dates) {
      setStartDate(dateStrings[0]);
      setEndDate(dateStrings[1]);
      fetchReport({ startDate: dateStrings[0], endDate: dateStrings[1] });
    } else {
      setStartDate(undefined);
      setEndDate(undefined);
      fetchReport({ startDate: undefined, endDate: undefined });
    }
  };

  const setPresetRange = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);

    const endStr = end.toISOString().split('T')[0];
    const startStr = start.toISOString().split('T')[0];

    setStartDate(startStr);
    setEndDate(endStr);
    fetchReport({ startDate: startStr, endDate: endStr });
  };

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

  const metrics = reportData?.metrics || {
    totalSales: 0,
    transactionCount: 0,
    averageTransactionValue: 0,
    uniqueCustomersCount: 0,
  };

  const items = [
    {
      key: 'products',
      label: <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>Produk Terlaris</span>,
      children: (
        <Table
          dataSource={reportData?.topProducts || []}
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
          dataSource={reportData?.salesByCashier || []}
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
          <Title level={2} style={{ margin: 0, fontFamily: "'Playfair Display', serif", color: '#C2410C' }}>Laporan Penjualan</Title>
          <Paragraph style={{ fontFamily: "'Inter', sans-serif", color: '#57534E', fontSize: '15px' }}>
            Pantau performa penjualan, produk terlaris, dan kinerja kasir UMKM Anda.
          </Paragraph>
        </div>
        
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
            Ekspor CSV
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

      {/* Filter Toolbar */}
      <Card style={{ marginBottom: '24px', borderColor: '#E7E5E4', background: '#FFFFFF' }} bodyStyle={{ padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <Space wrap>
            <span style={{ fontWeight: 600, color: '#1C1917' }}><CalendarOutlined /> Rentang Waktu:</span>
            <RangePicker
              onChange={handleRangeChange}
              placeholder={['Mulai Tanggal', 'Selesai Tanggal']}
              style={{ borderColor: '#D6D3D1' }}
            />
          </Space>
          <Space>
            <Button size="small" onClick={() => setPresetRange(0)} style={{ borderRadius: '4px' }}>Hari Ini</Button>
            <Button size="small" onClick={() => setPresetRange(7)} style={{ borderRadius: '4px' }}>7 Hari Terakhir</Button>
            <Button size="small" onClick={() => setPresetRange(30)} style={{ borderRadius: '4px' }}>30 Hari Terakhir</Button>
          </Space>
        </div>
      </Card>

      {/* Metrics Cards */}
      <Spin spinning={loading}>
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={true} style={{ background: '#FFFFFF', borderLeft: '4px solid #C2410C', borderColor: '#E7E5E4' }}>
              <Statistic
                title={<span style={{ color: '#57534E', fontWeight: 600 }}>Total Pendapatan</span>}
                value={metrics.totalSales}
                formatter={(val) => formatter.format(val as number)}
                valueStyle={{ color: '#C2410C', fontWeight: 'bold', fontSize: '24px' }}
                prefix={<LineChartOutlined style={{ color: '#C2410C' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={true} style={{ background: '#FFFFFF', borderLeft: '4px solid #365314', borderColor: '#E7E5E4' }}>
              <Statistic
                title={<span style={{ color: '#57534E', fontWeight: 600 }}>Jumlah Transaksi</span>}
                value={metrics.transactionCount}
                valueStyle={{ color: '#365314', fontWeight: 'bold', fontSize: '24px' }}
                prefix={<ShopOutlined style={{ color: '#365314' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={true} style={{ background: '#FFFFFF', borderLeft: '4px solid #D4A373', borderColor: '#E7E5E4' }}>
              <Statistic
                title={<span style={{ color: '#57534E', fontWeight: 600 }}>Rata-rata Transaksi</span>}
                value={metrics.averageTransactionValue}
                formatter={(val) => formatter.format(val as number)}
                valueStyle={{ color: '#9A3412', fontWeight: 'bold', fontSize: '24px' }}
                prefix={<GiftOutlined style={{ color: '#D4A373' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={true} style={{ background: '#FFFFFF', borderLeft: '4px solid #57534E', borderColor: '#E7E5E4' }}>
              <Statistic
                title={<span style={{ color: '#57534E', fontWeight: 600 }}>Pelanggan Unik (Member)</span>}
                value={metrics.uniqueCustomersCount}
                valueStyle={{ color: '#1C1917', fontWeight: 'bold', fontSize: '24px' }}
                prefix={<UserOutlined style={{ color: '#57534E' }} />}
              />
            </Card>
          </Col>
        </Row>

        {/* Charts & SVG Graphics */}
        <div style={{ marginBottom: '24px' }}>
          <ReportsCharts
            salesData={reportData?.salesOverTime || []}
            topProducts={reportData?.topProducts || []}
          />
        </div>

        {/* Detailed Data Tabs */}
        <Card style={{ borderColor: '#E7E5E4', background: '#FFFFFF' }}>
          <Tabs defaultActiveKey="products" items={items} />
        </Card>
      </Spin>
    </div>
  );
};
