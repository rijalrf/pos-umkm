import React from 'react';
import { Modal, Button } from 'antd';

interface FormModalProps {
  open: boolean;
  title: string;
  onCancel: () => void;
  onSubmit?: () => void;
  loading?: boolean;
  fetchLoading?: boolean;
  submitText?: string;
  cancelText?: string;
  width?: number | string;
  children: React.ReactNode;
  hideFooter?: boolean;
}

export const FormModal: React.FC<FormModalProps> = ({
  open,
  title,
  onCancel,
  onSubmit,
  loading = false,
  fetchLoading = false,
  submitText = 'Simpan',
  cancelText = 'Batal',
  width = 520,
  children,
  hideFooter = false,
}) => {
  return (
    <Modal
      title={<span className="modal-title">{title}</span>}
      open={open}
      onCancel={onCancel}
      loading={fetchLoading}
      footer={
        hideFooter ? null : (
          <div className="form-modal-footer">
            <Button onClick={onCancel} disabled={loading} className="btn-cancel">
              {cancelText}
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              onClick={onSubmit}
              className="btn-primary-terracotta"
            >
              {submitText}
            </Button>
          </div>
        )
      }
      width={width}
      destroyOnClose
      className="form-modal"
    >
      {children}
    </Modal>
  );
};
