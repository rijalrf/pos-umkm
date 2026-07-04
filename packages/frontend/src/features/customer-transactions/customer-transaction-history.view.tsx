import React, { useEffect } from 'react';
import { Card, Table, Typography, Spin, Empty, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useCustomerTransactionsPresenter } from './customer-transactions.presenter';
import { DEFAULT_PAGINATION } from '../../libs/pagination.lib';
import { transactionHistoryColumns } from './customer-transaction-history.columns';
import type { TransactionRecord } from './customer-transactions.types';

const { Title, Paragraph } = Typography;

export const TransactionHistoryView: React.FC = () => {
  const navigate = useNavigate();
  const presenter = useCustomerTransactionsPresenter();

  useEffect(() => {
    presenter.fetchHistory();
  }, [presenter.fetchHistory]);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} className="headline-text" style={{ color: 'var(--color-primary)', margin: 0 }}>
          Riwayat Belanja
        </Title>
        <Paragraph className="body-text" style={{ color: '#57534E', fontSize: '15px' }}>
          Berikut adalah daftar transaksi belanja yang Anda lakukan sebagai member POS UMKM.
        </Paragraph>
      </div>

      <Spin spinning={presenter.loading}>
        <Card>
          {presenter.transactions.length > 0 ? (
            <Table<TransactionRecord>
              dataSource={presenter.transactions as TransactionRecord[]}
              columns={transactionHistoryColumns}
              rowKey="id"
              scroll={{ x: true }}
              pagination={DEFAULT_PAGINATION}
              bordered={false}
              expandable={{
                expandedRowRender: (record: TransactionRecord) => (
                  <div className="expanded-row-content">
                    <Title level={5} className="headline-text" style={{ margin: '0 0 12px 0' }}>Rincian Pembayaran</Title>
                    <table className="expanded-table">
                      <tbody>
                        {record.items.map((item, idx: number) => (
                          <tr key={idx}>
                            <td className="expanded-table-label">{item.product.name} (x{item.quantity})</td>
                            <td className="expanded-table-value">
                              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(item.priceAtPurchase) * item.quantity)}
                            </td>
                          </tr>
                        ))}
                        <tr>
                          <td className="expanded-table-total-label">Total Bayar</td>
                          <td className="expanded-table-total-value">
                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(record.totalAmount))}
                          </td>
                        </tr>
                        <tr>
                          <td className="expanded-table-label">Uang Diterima</td>
                          <td className="expanded-table-value" style={{ color: '#57534E' }}>
                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(record.cashReceived))}
                          </td>
                        </tr>
                        <tr>
                          <td className="expanded-table-label" style={{ color: 'var(--color-tertiary)', fontWeight: 600 }}>Kembalian</td>
                          <td className="expanded-table-value" style={{ color: 'var(--color-tertiary)', fontWeight: 600 }}>
                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(record.cashReturn))}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ),
                rowExpandable: () => true,
              }}
            />
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Anda belum memiliki riwayat transaksi belanja"
              className="empty-state"
            >
              <Button type="primary" onClick={() => navigate('/customer/catalog')} className="btn-primary-terracotta">
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
