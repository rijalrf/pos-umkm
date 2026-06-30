import React from 'react';
import { Result } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';

export const SalesView: React.FC = () => (
  <Result
    icon={<ShoppingCartOutlined style={{ fontSize: '72px', color: '#6366f1' }} />}
    title="Kasir / Sales Module"
    subTitle="This module is scheduled for Sprint 4 (Sales/Transactions)."
  />
);
