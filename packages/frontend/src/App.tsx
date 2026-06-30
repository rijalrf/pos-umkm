import React from 'react';
import { ConfigProvider, theme } from 'antd';
import { AppRoutes } from './routes';

export const App: React.FC = () => {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#C2410C', // Terracotta
          colorInfo: '#3B82F6',
          colorSuccess: '#22C55E',
          colorWarning: '#F59E0B',
          colorError: '#DC2626',
          colorBgBase: '#FFFBF5', // Warm Cream base
          colorBgContainer: '#FFFFFF', // Surface
          colorTextBase: '#1C1917', // Dark charcoal/slate
          borderRadius: 4, // Small radius: 4px for buttons, inputs
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          fontFamilyCode: "'Source Code Pro', monospace",
        },
        components: {
          Button: {
            borderRadius: 4,
            fontWeight: 600,
            fontFamily: "'Inter', sans-serif",
            colorPrimary: '#C2410C',
            colorPrimaryHover: '#9A3412',
            colorPrimaryActive: '#7C2D12',
          },
          Input: {
            borderRadius: 4,
            controlHeight: 42,
            fontFamily: "'Inter', sans-serif",
            colorBorder: '#D6D3D1',
            colorPrimaryHover: '#C2410C',
            colorTextPlaceholder: '#A8A29E',
          },
          InputNumber: {
            borderRadius: 4,
            controlHeight: 42,
            colorBorder: '#D6D3D1',
            colorPrimaryHover: '#C2410C',
          },
          Select: {
            borderRadius: 4,
            controlHeight: 42,
            colorBorder: '#D6D3D1',
            colorPrimaryHover: '#C2410C',
          },
          Card: {
            borderRadius: 8, // Cards use 8px
            colorBorderSecondary: '#E7E5E4',
          },
          Table: {
            borderRadius: 8,
          },
          Modal: {
            borderRadius: 8,
            fontFamily: "'Inter', sans-serif",
          },
          Typography: {
            fontFamily: "'Inter', sans-serif",
          },
          Menu: {
            itemBg: 'transparent',
            itemSelectedBg: '#FDF6EC',
            itemSelectedColor: '#C2410C',
            itemColor: '#57534E',
            itemHoverBg: '#FFFBF5',
            itemHoverColor: '#C2410C',
            itemActiveBg: '#FDF6EC',
            fontFamily: "'Inter', sans-serif",
          },

        },
      }}
    >
      <AppRoutes />
    </ConfigProvider>
  );
};

export default App;

