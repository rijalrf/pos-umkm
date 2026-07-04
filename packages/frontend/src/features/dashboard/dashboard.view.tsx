import React, { useEffect } from 'react';
import { Card, Col, Row, Statistic, Typography, Spin, Table } from 'antd';
import { ShoppingOutlined, UserOutlined, LineChartOutlined, ShopOutlined, HistoryOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../stores/auth.store';
import { useDashboardPresenter } from './dashboard.presenter';
import { ReportsCharts } from '../reports/reports-charts.component';
import { TopProductData } from '../reports/reports.types';

const { Title, Paragraph } = Typography;

export const DashboardView: React.FC = () => {
  const { user } = useAuthStore();
  const presenter = useDashboardPresenter();

  useEffect(() => {
    presenter.fetchDashboardData(user?.role === 'ADMIN');
  }, [user, presenter.fetchDashboardData]);

  const formatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  });

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

  return (
    <div>
      <div className="page-header">
        <div>
          <Title level={2} className="page-title">Dashboard</Title>
          <Paragraph className="page-subtitle">
            Selamat datang kembali, {user?.fullName}. Berikut adalah ringkasan sistem kasir dan penjualan Anda.
          </Paragraph>
        </div>
      </div>

      {user?.role === 'ADMIN' ? (
        <Spin spinning={presenter.loading}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Card bordered className="card-stat card-stat-primary">
                <Statistic
                  title={<span className="metric-title">Total Pendapatan</span>}
                  value={presenter.reportData?.metrics.totalSales || 0}
                  formatter={(val) => formatter.format(val as number)}
                  valueStyle={{ color: '#C2410C', fontWeight: 'bold' }}
                  prefix={<LineChartOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card bordered className="card-stat card-stat-tertiary">
                <Statistic
                  title={<span className="metric-title">Total Penjualan</span>}
                  value={presenter.reportData?.metrics.transactionCount || 0}
                  suffix="transaksi"
                  valueStyle={{ color: '#365314', fontWeight: 'bold' }}
                  prefix={<ShopOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card bordered className="card-stat card-stat-secondary">
                <Statistic
                  title={<span className="metric-title">Pelanggan Member</span>}
                  value={presenter.reportData?.metrics.uniqueCustomersCount || 0}
                  suffix="orang"
                  valueStyle={{ color: '#D4A373', fontWeight: 'bold' }}
                  prefix={<UserOutlined />}
                />
              </Card>
            </Col>
          </Row>

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
              <Card className="card-full-height" title={<span><HistoryOutlined className="text-tertiary-color" /> Panduan Cepat</span>}>
                <Paragraph className="body-small">
                  Aplikasi POS UMKM dirancang untuk memudahkan transaksi kasir secara offline maupun online.
                </Paragraph>
                <ul className="guide-list">
                  <li><strong>Kelola Produk:</strong> Tambahkan produk baru dan sinkronisasikan gambar ke Google Drive Anda.</li>
                  <li><strong>Transaksi Penjualan:</strong> Gunakan menu <em>Penjualan</em> untuk mencatat kasir secara cepat dan mencetak struk.</li>
                  <li><strong>Analisis Penjualan:</strong> Buka menu <em>Laporan</em> untuk mengekspor data transaksi ke spreadsheet (CSV) atau mencetak laporan PDF.</li>
                </ul>
              </Card>
            </Col>
          </Row>
        </Spin>
      ) : (
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Card title={<span className="text-semibold">Akses Kasir</span>}>
              <Paragraph className="body-text">
                Halo, Anda login sebagai Kasir. Gunakan menu <strong>Penjualan</strong> untuk mulai melayani transaksi pembayaran pelanggan.
              </Paragraph>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};
