import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, Typography, Spin, Table } from 'antd';
import { ShoppingOutlined, UserOutlined, LineChartOutlined, ShopOutlined, HistoryOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../stores/auth.store';
import { ReportsService, ReportResponseData } from '../reports/reports.service';
import { ReportsCharts } from '../reports/reports-charts.component';

const { Title, Paragraph } = Typography;

export const DashboardView: React.FC = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportResponseData | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      // Only Admin should fetch full sales dashboard reports
      if (user?.role === 'ADMIN') {
        setLoading(true);
        try {
          const res = await ReportsService.getSalesReport();
          if (res.success) {
            setReportData(res.data);
          }
        } catch (err) {
          console.error('Failed to load dashboard report stats:', err);
        } finally {
          setLoading(false);
        }
      }
    }
    loadDashboardData();
  }, [user]);

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
      render: (text: string) => <span style={{ fontWeight: 500 }}>{text}</span>,
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
          fontSize: '11px',
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
      render: (text: number) => <strong>{text} pcs</strong>,
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0, fontFamily: "'Inter', sans-serif", color: '#C2410C' }}>Dashboard</Title>
        <Paragraph style={{ fontFamily: "'Inter', sans-serif", color: '#57534E', fontSize: '15px' }}>
          Selamat datang kembali, {user?.fullName}. Berikut adalah ringkasan sistem kasir dan penjualan Anda.
        </Paragraph>
      </div>

      {user?.role === 'ADMIN' ? (
        <Spin spinning={loading}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Card bordered={true} style={{ background: '#FFFFFF', borderLeft: '4px solid #C2410C', borderColor: '#E7E5E4' }}>
                <Statistic
                  title={<span style={{ color: '#57534E', fontWeight: 600 }}>Total Pendapatan</span>}
                  value={reportData?.metrics.totalSales || 0}
                  formatter={(val) => formatter.format(val as number)}
                  valueStyle={{ color: '#C2410C', fontWeight: 'bold' }}
                  prefix={<LineChartOutlined style={{ color: '#C2410C' }} />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card bordered={true} style={{ background: '#FFFFFF', borderLeft: '4px solid #365314', borderColor: '#E7E5E4' }}>
                <Statistic
                  title={<span style={{ color: '#57534E', fontWeight: 600 }}>Total Penjualan</span>}
                  value={reportData?.metrics.transactionCount || 0}
                  suffix="transaksi"
                  valueStyle={{ color: '#365314', fontWeight: 'bold' }}
                  prefix={<ShopOutlined style={{ color: '#365314' }} />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card bordered={true} style={{ background: '#FFFFFF', borderLeft: '4px solid #D4A373', borderColor: '#E7E5E4' }}>
                <Statistic
                  title={<span style={{ color: '#57534E', fontWeight: 600 }}>Pelanggan Member</span>}
                  value={reportData?.metrics.uniqueCustomersCount || 0}
                  suffix="orang"
                  valueStyle={{ color: '#D4A373', fontWeight: 'bold' }}
                  prefix={<UserOutlined style={{ color: '#D4A373' }} />}
                />
              </Card>
            </Col>
          </Row>

          <div style={{ marginTop: '24px' }}>
            <ReportsCharts
              salesData={reportData?.salesOverTime || []}
              topProducts={reportData?.topProducts || []}
            />
          </div>

          <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
            <Col xs={24} md={12}>
              <Card
                style={{ borderColor: '#E7E5E4', background: '#FFFFFF', height: '100%' }}
                title={<span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}><ShoppingOutlined style={{ color: '#C2410C' }} /> 5 Produk Terlaris</span>}
              >
                <Table
                  dataSource={reportData?.topProducts.slice(0, 5) || []}
                  columns={topProductColumns}
                  rowKey="productId"
                  pagination={false}
                  size="small"
                  bordered={false}
                />
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card
                style={{ borderColor: '#E7E5E4', background: '#FFFFFF', height: '100%' }}
                title={<span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}><HistoryOutlined style={{ color: '#365314' }} /> Panduan Cepat</span>}
              >
                <Paragraph style={{ fontFamily: "'Inter', sans-serif", color: '#1C1917', lineHeight: '1.6', fontSize: '14px' }}>
                  Aplikasi POS UMKM dirancang untuk memudahkan transaksi kasir secara offline maupun online.
                </Paragraph>
                <ul style={{ paddingLeft: '20px', fontFamily: "'Inter', sans-serif", color: '#57534E', lineHeight: '1.8', fontSize: '13px' }}>
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
            <Card style={{ borderColor: '#E7E5E4', background: '#FFFFFF' }} title={<span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>Akses Kasir</span>}>
              <Paragraph style={{ fontFamily: "'Inter', sans-serif", color: '#1C1917', lineHeight: '1.6' }}>
                Halo, Anda login sebagai Kasir. Gunakan menu <strong>Penjualan</strong> untuk mulai melayani transaksi pembayaran pelanggan.
              </Paragraph>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default DashboardView;
