import React from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import { UsersPresenter } from './users.presenter';

interface PasswordChangeModalViewProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

export const PasswordChangeModalView: React.FC<PasswordChangeModalViewProps> = ({
  visible,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const presenter = new UsersPresenter();
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      await presenter.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      message.success('Password changed successfully!');
      form.resetFields();
      onSuccess();
    } catch (err: any) {
      if (err.errorFields) return; // Validation error
      message.error(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={visible}
      title={
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', color: '#C2410C' }}>
          Change Password
        </span>
      }
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel} style={{ borderRadius: '4px' }}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
          style={{
            backgroundColor: '#C2410C',
            borderColor: '#C2410C',
            borderRadius: '4px',
          }}
        >
          Change Password
        </Button>,
      ]}
      style={{ borderRadius: '8px', overflow: 'hidden' }}
    >
      <Form form={form} layout="vertical" requiredMark={false} style={{ marginTop: '16px' }}>
        <Form.Item
          name="currentPassword"
          label={<span style={{ fontWeight: 600, fontSize: '13px', color: '#1C1917' }}>Current Password</span>}
          rules={[{ required: true, message: 'Please enter your current password' }]}
        >
          <Input.Password placeholder="Enter current password" />
        </Form.Item>

        <Form.Item
          name="newPassword"
          label={<span style={{ fontWeight: 600, fontSize: '13px', color: '#1C1917' }}>New Password</span>}
          rules={[
            { required: true, message: 'Please enter new password' },
            { min: 6, message: 'Password must be at least 6 characters' },
          ]}
        >
          <Input.Password placeholder="Enter new password (min 6 characters)" />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label={<span style={{ fontWeight: 600, fontSize: '13px', color: '#1C1917' }}>Confirm New Password</span>}
          dependencies={['newPassword']}
          rules={[
            { required: true, message: 'Please confirm your new password' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('The two passwords that you entered do not match!'));
              },
            }),
          ]}
        >
          <Input.Password placeholder="Confirm new password" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
