import React from 'react';
import { Breadcrumb } from 'antd';
import { useLocation, Link } from 'react-router-dom';

const routeLabels: Record<string, string> = {
  backoffice: 'Backoffice',
  products: 'Produk',
  categories: 'Kategori',
  users: 'Pengguna',
  reports: 'Laporan',
  sales: 'Kasir',
  transactions: 'Penjualan',
  customers: 'Pelanggan',
  settings: 'Pengaturan',
};

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // If path is root or customer, don't show backoffice breadcrumbs
  if (pathnames.length === 0 || pathnames[0] !== 'backoffice') {
    return null;
  }

  const breadcrumbItems = pathnames.map((name, index) => {
    const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
    const isLast = index === pathnames.length - 1;
    const label = routeLabels[name] || name.charAt(0).toUpperCase() + name.slice(1);

    return {
      key: routeTo,
      title: isLast ? (
        <span style={{ color: '#57534E', fontWeight: 500, fontFamily: "'Inter', sans-serif" }}>{label}</span>
      ) : (
        <Link to={routeTo} style={{ color: '#C2410C', fontWeight: 500, fontFamily: "'Inter', sans-serif" }}>
          {label}
        </Link>
      ),
    };
  });

  return (
    <div style={{ marginBottom: '12px' }}>
      <Breadcrumb items={breadcrumbItems} />
    </div>
  );
};

export default Breadcrumbs;
