import React from 'react';
import { ConfigProvider, theme } from 'antd';
import { AppRoutes } from './routes';

export const App: React.FC = () => {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#6366f1', // Modern Indigo primary accent
          borderRadius: 8,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
        },
      }}
    >
      <AppRoutes />
    </ConfigProvider>
  );
};

export default App;
