import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginView } from '../features/auth/login.view';
import { DashboardView } from '../features/dashboard/dashboard.view';
import { ProductListView } from '../features/products/product-list.view';
import { CategoryListView } from '../features/categories/category-list.view';
import { SalesView } from '../features/sales/sales.view';
import { SettingsView } from '../features/settings/store-settings.view';
import { ReportsView } from '../features/reports/reports.view';
import { BackofficeLayout } from '../components/layout/backoffice-layout';
import { ProtectedRoute } from '../components/common/protected-route.component';

// Customer feature routes
import { CustomerLayout } from '../components/layout/customer-layout';
import { CatalogView } from '../features/customer-frontend/catalog.view';
import { ProductDetailView } from '../features/customer-frontend/product-detail.view';
import { CustomerLoginView } from '../features/customer-frontend/customer-login.view';
import { CustomerRegisterView } from '../features/customer-frontend/customer-register.view';
import { VerifyEmailView } from '../features/customer-frontend/verify-email.view';
import { TransactionHistoryView } from '../features/customer-frontend/transaction-history.view';
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
          path="reports"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <ReportsView />
            </ProtectedRoute>
          }
        />
        
        {/* Common backoffice views */}
        <Route path="sales" element={<SalesView />} />
        <Route path="settings" element={<SettingsView />} />
      </Route>

      {/* Customer Shop Catalog & Member Account Flow */}
      <Route path="/customer" element={<CustomerLayout />}>
        <Route index element={<Navigate to="catalog" replace />} />
        <Route path="catalog" element={<CatalogView />} />
        <Route path="product/:id" element={<ProductDetailView />} />
        <Route path="login" element={<CustomerLoginView />} />
        <Route path="register" element={<CustomerRegisterView />} />
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
