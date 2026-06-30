import React from 'react';
import { Result } from 'antd';
import { SettingOutlined } from '@ant-design/icons';

export const SettingsView: React.FC = () => (
  <Result
    icon={<SettingOutlined style={{ fontSize: '72px', color: '#6366f1' }} />}
    title="Settings Module"
    subTitle="This module is scheduled for Sprint 3 (Google Drive Configuration) and Sprint 7 (Store Settings)."
  />
);
