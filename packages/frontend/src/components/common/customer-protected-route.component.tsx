import React from 'react';
import { Navigate } from 'react-router-dom';
import { useCustomerStore } from '../../stores/customer.store';

interface CustomerProtectedRouteProps {
  children: React.ReactNode;
}

export const CustomerProtectedRoute: React.FC<CustomerProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useCustomerStore();

  if (!isAuthenticated) {
    return <Navigate to="/customer/login" replace />;
  }

  return <>{children}</>;
};
export default CustomerProtectedRoute;
