export const formatCurrency = (amount: string | number) => {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
};

const paymentMethodMap: Record<string, string> = {
  CASH: 'Tunai',
  QRIS: 'QRIS',
  DEBIT: 'Debit',
  TRANSFER: 'Transfer',
};

export const formatPaymentMethod = (method: string) => {
  return paymentMethodMap[method] || method;
};

const orderStatusMap: Record<string, string> = {
  PENDING: 'DITERIMA',
  PROCESSING: 'DIPROSES',
  COMPLETED: 'SELESAI',
};

export const formatOrderStatus = (status: string) => {
  return orderStatusMap[status] || status;
};

const paymentStatusMap: Record<string, string> = {
  UNPAID: 'MENUNGGU PEMBAYARAN',
  PAID: 'LUNAS',
};

export const formatPaymentStatus = (status: string) => {
  return paymentStatusMap[status] || status;
};
