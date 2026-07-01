import React from 'react';
import { Modal, Button, Typography } from 'antd';
import { WarningOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  confirmLoading?: boolean;
  okText?: string;
  cancelText?: string;
  danger?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  title,
  description,
  onConfirm,
  onCancel,
  confirmLoading = false,
  okText = 'Ya, Hapus',
  cancelText = 'Batal',
  danger = true,
}) => {
  return (
    <Modal
      open={open}
      onCancel={onCancel}
      closable={false}
      footer={null}
      width={360}
      centered
      destroyOnClose
      styles={{
        content: { padding: '10px' },
        body: { padding: '5px' }
      }}
    >
      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
        <div style={{
          backgroundColor: danger ? '#FEE2E2' : '#FDF6EC',
          padding: '6px',
          borderRadius: '50%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: danger ? '#DC2626' : '#C2410C',
          flexShrink: 0
        }}>
          <WarningOutlined style={{ fontSize: '18px' }} />
        </div>
        <div style={{ flex: 1 }}>
          <Title level={5} style={{ margin: 0, fontFamily: "'Inter', sans-serif", fontWeight: 700, color: '#1C1917', fontSize: '14px' }}>
            {title}
          </Title>
          <Paragraph style={{ margin: '4px 0 0 0', fontFamily: "'Inter', sans-serif", color: '#57534E', fontSize: '12px', lineHeight: 1.4 }}>
            {description}
          </Paragraph>
        </div>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
        <Button onClick={onCancel} disabled={confirmLoading} style={{ borderRadius: '4px', height: '32px', fontSize: '13px' }}>
          {cancelText}
        </Button>
        <Button
          type="primary"
          danger={danger}
          loading={confirmLoading}
          onClick={onConfirm}
          style={{
            backgroundColor: danger ? '#DC2626' : '#C2410C',
            borderColor: danger ? '#DC2626' : '#C2410C',
            borderRadius: '4px',
            fontWeight: 600,
            height: '32px',
            fontSize: '13px',
          }}
        >
          {okText}
        </Button>
      </div>
    </Modal>
  );
};
