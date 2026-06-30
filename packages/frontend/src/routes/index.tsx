import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginView } from '../features/auth/login.view';
import { DashboardView } from '../features/dashboard/dashboard.view';
import { ProductListView } from '../features/products/product-list.view';
import { CategoryListView } from '../features/categories/category-list.view';
import { SalesView } from '../features/sales/sales.view';
import { SettingsView } from '../features/settings/store-settings.view';
import { BackofficeLayout } from '../components/layout/backoffice-layout';
import { ProtectedRoute } from '../components/common/protected-route.component';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginView />} />
      
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
        
        {/* Common backoffice views */}
        <Route path="sales" element={<SalesView />} />
        <Route path="settings" element={<SettingsView />} />
      </Route>

      <Route path="*" element={<Navigate to="/backoffice" replace />} />
    </Routes>
  );
};
