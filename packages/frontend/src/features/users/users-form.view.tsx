import React, { useEffect } from 'react';
import { Form, Input, Select, Switch, message } from 'antd';
import { UsersPresenter } from './users.presenter';
import { FormModal } from '../../components/common/form-modal.component';
import { UserFormViewProps, UserPayload } from './users.types';

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
        const updateData: Partial<UserPayload> = {
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
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'errorFields' in err) return; // Validation error
      const errorMsg = err instanceof Error ? err.message : 'Failed to save user';
      message.error(errorMsg);
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <FormModal
      title={isEdit ? 'Edit User' : 'Add New User'}
      open={visible}
      onCancel={onCancel}
      onSubmit={handleSubmit}
      loading={confirmLoading}
      fetchLoading={fetchingUser}
      submitText={isEdit ? 'Save Changes' : 'Create User'}
      cancelText="Cancel"
      width={480}
    >
      <Form form={form} layout="vertical" requiredMark={false}>
        <Form.Item
          name="username"
          label={<span className="form-label-bold">Username</span>}
          rules={[
            { required: true, message: 'Please enter username' },
            { min: 3, message: 'Username must be at least 3 characters' },
          ]}
        >
          <Input placeholder="Enter username (e.g. kasir2)" disabled={isEdit} className="input-medium" />
        </Form.Item>

        <Form.Item
          name="fullName"
          label={<span className="form-label-bold">Full Name</span>}
          rules={[{ required: true, message: 'Please enter full name' }]}
        >
          <Input placeholder="Enter full name" className="input-medium" />
        </Form.Item>

        <Form.Item
          name="password"
          label={<span className="form-label-bold">Password</span>}
          rules={[
            { required: !isEdit, message: 'Please enter password' },
            { min: 6, message: 'Password must be at least 6 characters' },
          ]}
        >
          <Input.Password
            className="input-medium"
            placeholder={
              isEdit
                ? 'Leave blank to keep current password'
                : 'Enter password (min 6 characters)'
            }
          />
        </Form.Item>

        <div className="form-row-grid">
          <Form.Item
            name="role"
            label={<span className="form-label-bold">Role</span>}
            rules={[{ required: true, message: 'Please select role' }]}
          >
            <Select className="input-medium">
              <Select.Option value="ADMIN">Admin</Select.Option>
              <Select.Option value="CASHIER">Kasir</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="isActive"
            label={<span className="form-label-bold">Status</span>}
            valuePropName="checked"
          >
            <div className="switch-container">
              <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
            </div>
          </Form.Item>
        </div>
      </Form>
    </FormModal>
  );
};
