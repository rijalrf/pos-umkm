import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginView } from '../features/auth/auth-login.view';
import { DashboardView } from '../features/dashboard/dashboard.view';
import { ProductListView } from '../features/products/products-list.view';
import { CategoryListView } from '../features/categories/categories-list.view';
import { SalesView } from '../features/sales/sales.view';
import { TransactionListView } from '../features/sales/sales-list.view';
import { SettingsView } from '../features/settings/settings.view';
import { ReportsView } from '../features/reports/reports.view';
import { UserListView } from '../features/users/users-list.view';
import { ProfileView } from '../features/users/users-profile.view';
import { CustomerListView } from '../features/customers/customers-list.view';
import { TableListView } from '../features/tables/tables-list.view';
import { BackofficeLayout } from '../components/layout/backoffice-layout';
import { ProtectedRoute } from '../components/common/protected-route.component';

// Customer feature routes
import { CustomerLayout } from '../components/layout/customer-layout';
import { CatalogView } from '../features/customer-frontend/customer-catalog.view';
import { ProductDetailView } from '../features/customer-frontend/customer-product-detail.view';
import { VerifyEmailView } from '../features/customer-frontend/customer-verify-email.view';
import { TransactionHistoryView } from '../features/customer-frontend/customer-transaction-history.view';
import { CheckoutView } from '../features/customer-frontend/customer-checkout.view';
import { TableEntryView } from '../features/customer-frontend/customer-table-entry.view';
import { CustomerProtectedRoute } from '../components/common/customer-protected-route.component';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginView />} />
      <Route path="/verify-email" element={<VerifyEmailView />} />
      
      <Route
        path="/backoffice"
        element={
          <ProtectedRoute>
            <BackofficeLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardView />} />
        
        {/* Admin only views */}
        <Route
          path="products"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <ProductListView />
            </ProtectedRoute>
          }
        />
        <Route
          path="categories"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <CategoryListView />
            </ProtectedRoute>
          }
        />
        <Route
          path="tables"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <TableListView />
            </ProtectedRoute>
          }
        />
        <Route
          path="reports"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <ReportsView />
            </ProtectedRoute>
          }
        />
        <Route
          path="users"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <UserListView />
            </ProtectedRoute>
          }
        />
        
        {/* Common backoffice views */}
        <Route path="sales" element={<SalesView />} />
        <Route path="transactions" element={<TransactionListView />} />
        <Route path="customers" element={<CustomerListView />} />
        <Route path="settings" element={<SettingsView />} />
        <Route path="profile" element={<ProfileView />} />
      </Route>

      {/* Customer Shop Catalog & Member Account Flow */}
      <Route path="/customer" element={<CustomerLayout />}>
        <Route index element={<Navigate to="catalog" replace />} />
        <Route path="catalog" element={<CatalogView />} />
        <Route path="product/:id" element={<ProductDetailView />} />
        <Route path="login" element={<Navigate to="/customer/catalog" replace />} />
        <Route path="register" element={<Navigate to="/customer/catalog" replace />} />
        <Route path="checkout" element={<CheckoutView />} />
        <Route path="t/:tableId" element={<TableEntryView />} />
        <Route path="verify-email" element={<VerifyEmailView />} />
        <Route
          path="history"
          element={
            <CustomerProtectedRoute>
              <TransactionHistoryView />
            </CustomerProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/customer/catalog" replace />} />
    </Routes>
  );
};
