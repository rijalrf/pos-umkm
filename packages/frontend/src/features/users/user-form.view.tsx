import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, Switch, Button, message } from 'antd';
import { UsersPresenter } from './users.presenter';

interface UserFormViewProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  userId: string | null; // null for create, string for edit
}

export const UserFormView: React.FC<UserFormViewProps> = ({
  visible,
  onCancel,
  onSuccess,
  userId,
}) => {
  const [form] = Form.useForm();
  const presenter = new UsersPresenter();
  const [confirmLoading, setConfirmLoading] = React.useState(false);
  const [fetchingUser, setFetchingUser] = React.useState(false);

  const isEdit = !!userId;

  useEffect(() => {
    if (visible) {
      form.resetFields();
      if (isEdit && userId) {
        setFetchingUser(true);
        presenter
          .getUserById(userId)
          .then((data) => {
            form.setFieldsValue({
              username: data.username,
              fullName: data.fullName,
              role: data.role,
              isActive: data.isActive,
            });
          })
          .catch((err) => {
            message.error(err.message || 'Failed to load user details');
            onCancel();
          })
          .finally(() => {
            setFetchingUser(false);
          });
      } else {
        form.setFieldsValue({
          isActive: true,
          role: 'CASHIER',
        });
      }
    }
  }, [visible, userId]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setConfirmLoading(true);

      if (isEdit && userId) {
        // Update user
        const updateData: any = {
          username: values.username,
          fullName: values.fullName,
          role: values.role,
          isActive: values.isActive,
        };
        if (values.password) {
          updateData.password = values.password;
        }
        await presenter.updateUser(userId, updateData);
        message.success('User updated successfully');
      } else {
        // Create user
        await presenter.createUser({
          username: values.username,
          password: values.password,
          fullName: values.fullName,
          role: values.role,
          isActive: values.isActive,
        });
        message.success('User created successfully');
      }
      onSuccess();
    } catch (err: any) {
      if (err.errorFields) return; // Validation error
      message.error(err.message || 'Failed to save user');
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <Modal
      open={visible}
      title={
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '20px', color: '#C2410C' }}>
          {isEdit ? 'Edit User' : 'Add New User'}
        </span>
      }
      okText={isEdit ? 'Save Changes' : 'Create User'}
      cancelText="Cancel"
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      loading={fetchingUser}
      footer={[
        <Button key="cancel" onClick={onCancel} style={{ borderRadius: '4px' }}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={confirmLoading}
          onClick={handleSubmit}
          style={{
            backgroundColor: '#C2410C',
            borderColor: '#C2410C',
            borderRadius: '4px',
          }}
        >
          {isEdit ? 'Save Changes' : 'Create User'}
        </Button>,
      ]}
      style={{ borderRadius: '8px', overflow: 'hidden' }}
      styles={{
        body: { padding: '8px 0' },
      }}
    >
      <Form form={form} layout="vertical" requiredMark={false}>
        <Form.Item
          name="username"
          label={<span style={{ fontWeight: 600, fontSize: '13px', color: '#1C1917' }}>Username</span>}
          rules={[
            { required: true, message: 'Please enter username' },
            { min: 3, message: 'Username must be at least 3 characters' },
          ]}
        >
          <Input placeholder="Enter username (e.g. kasir2)" disabled={isEdit} />
        </Form.Item>

        <Form.Item
          name="fullName"
          label={<span style={{ fontWeight: 600, fontSize: '13px', color: '#1C1917' }}>Full Name</span>}
          rules={[{ required: true, message: 'Please enter full name' }]}
        >
          <Input placeholder="Enter full name" />
        </Form.Item>

        <Form.Item
          name="password"
          label={<span style={{ fontWeight: 600, fontSize: '13px', color: '#1C1917' }}>Password</span>}
          rules={[
            { required: !isEdit, message: 'Please enter password' },
            { min: 6, message: 'Password must be at least 6 characters' },
          ]}
        >
          <Input.Password
            placeholder={
              isEdit
                ? 'Leave blank to keep current password'
                : 'Enter password (min 6 characters)'
            }
          />
        </Form.Item>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Form.Item
            name="role"
            label={<span style={{ fontWeight: 600, fontSize: '13px', color: '#1C1917' }}>Role</span>}
            rules={[{ required: true, message: 'Please select role' }]}
          >
            <Select>
              <Select.Option value="ADMIN">Admin</Select.Option>
              <Select.Option value="CASHIER">Kasir</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="isActive"
            label={<span style={{ fontWeight: 600, fontSize: '13px', color: '#1C1917' }}>Status</span>}
            valuePropName="checked"
          >
            <div style={{ display: 'flex', alignItems: 'center', height: '32px' }}>
              <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
            </div>
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};
