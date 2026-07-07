import type { TableColumnsType } from 'antd';
import { formatCurrency } from '../../libs/format.lib';
import { TransactionRecord, TransactionItem } from './customer-transactions.types';

export const transactionHistoryColumns: TableColumnsType<TransactionRecord> = [
  {
    title: 'Kode Transaksi',
    dataIndex: 'transactionCode',
    key: 'transactionCode',
    render: (text: string) => (
      <span className="text-primary-color text-semibold">{text}</span>
    ),
  },
  {
    title: 'Tanggal Belanja',
    dataIndex: 'transactionDate',
    key: 'transactionDate',
    sorter: (a: TransactionRecord, b: TransactionRecord) =>
      new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime(),
    render: (dateStr: string) =>
      new Date(dateStr).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
  },
  {
    title: 'Produk Yang Dibeli',
    dataIndex: 'items',
    key: 'items',
    render: (items: TransactionItem[]) => (
      <div className="flex-column" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {items.map((item, idx) => (
          <div key={idx} className="body-small" style={{ color: '#1C1917' }}>
            &bull; {item.product.name} <strong>(x{item.quantity})</strong>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: 'Status Pesanan',
    dataIndex: 'orderStatus',
    key: 'orderStatus',
    render: (status: string) => {
      const colorMap: Record<string, string> = {
        PENDING: '#D97706',
        PROCESSING: '#2563EB',
        COMPLETED: '#78716C',
      };
      const labelMap: Record<string, string> = {
        PENDING: 'DITERIMA',
        PROCESSING: 'DIPROSES',
        COMPLETED: 'SELESAI',
      };
      return (
        <span style={{ color: colorMap[status] || '#78716C', fontWeight: 600, fontSize: '13px' }}>
          ● {labelMap[status] || status}
        </span>
      );
    },
  },
  {
    title: 'Status Pembayaran',
    dataIndex: 'paymentStatus',
    key: 'paymentStatus',
    render: (status: string, record: TransactionRecord) => (
      <span style={{ color: '#1C1917', fontWeight: 600, fontSize: '13px' }}>
        {status === 'PAID' ? 'Lunas' : 'Menunggu Pembayaran'} ({record.paymentMethod === 'QRIS' ? 'QRIS' : 'Tunai'})
      </span>
    ),
  },
  {
    title: 'Total Belanja',
    dataIndex: 'totalAmount',
    key: 'totalAmount',
    align: 'right' as const,
    sorter: (a: TransactionRecord, b: TransactionRecord) =>
      Number(a.totalAmount) - Number(b.totalAmount),
    render: (val: number) => (
      <strong className="text-semibold" style={{ color: '#1C1917', fontSize: '15px' }}>
        {formatCurrency(val)}
      </strong>
    ),
  },
];
