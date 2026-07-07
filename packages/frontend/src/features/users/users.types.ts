export interface UserPayload {
  username: string;
  password?: string;
  fullName: string;
  role: 'ADMIN' | 'CASHIER';
  isActive?: boolean;
}

export interface ChangePasswordPayload {
  currentPassword?: string;
  newPassword?: string;
}

export interface UserFormViewProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  userId: string | null;
}
