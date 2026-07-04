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
    title: 'Status Pembayaran',
    key: 'status',
    render: () => (
      <span className="status-chip status-chip-success">Lunas (Tunai)</span>
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
