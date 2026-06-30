import { UsersService, UserPayload, ChangePasswordPayload } from './users.service';

export class UsersPresenter {
  async getAllUsers() {
    try {
      const response = await UsersService.getAll();
      return response.data; // List of users
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch users');
    }
  }

  async getUserById(id: string) {
    try {
      const response = await UsersService.getById(id);
      return response.data; // User detail
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user details');
    }
  }

  async createUser(payload: UserPayload) {
    try {
      const response = await UsersService.create(payload);
      return response.data; // Created user
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create user');
    }
  }

  async updateUser(id: string, payload: Partial<UserPayload>) {
    try {
      const response = await UsersService.update(id, payload);
      return response.data; // Updated user
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update user');
    }
  }

  async deleteUser(id: string) {
    try {
      const response = await UsersService.delete(id);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete user');
    }
  }

  async changePassword(payload: ChangePasswordPayload) {
    try {
      const response = await UsersService.changePassword(payload);
      return response; // Success response
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to change password');
    }
  }
}
