import { AxiosError } from 'axios';
import { UsersService } from './users.service';
import { UserPayload, ChangePasswordPayload } from './users.types';

export class UsersPresenter {
  async getAllUsers() {
    try {
      const response = await UsersService.getAll();
      return response.data; // List of users
    } catch (error: unknown) {
      const message = error instanceof AxiosError ? error.response?.data?.message : 'Failed to fetch users';
      throw new Error(message || 'Failed to fetch users');
    }
  }

  async getUserById(id: string) {
    try {
      const response = await UsersService.getById(id);
      return response.data; // User detail
    } catch (error: unknown) {
      const message = error instanceof AxiosError ? error.response?.data?.message : 'Failed to fetch user details';
      throw new Error(message || 'Failed to fetch user details');
    }
  }

  async createUser(payload: UserPayload) {
    try {
      const response = await UsersService.create(payload);
      return response.data; // Created user
    } catch (error: unknown) {
      const message = error instanceof AxiosError ? error.response?.data?.message : 'Failed to create user';
      throw new Error(message || 'Failed to create user');
    }
  }

  async updateUser(id: string, payload: Partial<UserPayload>) {
    try {
      const response = await UsersService.update(id, payload);
      return response.data; // Updated user
    } catch (error: unknown) {
      const message = error instanceof AxiosError ? error.response?.data?.message : 'Failed to update user';
      throw new Error(message || 'Failed to update user');
    }
  }

  async deleteUser(id: string) {
    try {
      const response = await UsersService.delete(id);
      return response.data;
    } catch (error: unknown) {
      const message = error instanceof AxiosError ? error.response?.data?.message : 'Failed to delete user';
      throw new Error(message || 'Failed to delete user');
    }
  }

  async changePassword(payload: ChangePasswordPayload) {
    try {
      const response = await UsersService.changePassword(payload);
      return response; // Success response
    } catch (error: unknown) {
      const message = error instanceof AxiosError ? error.response?.data?.message : 'Failed to change password';
      throw new Error(message || 'Failed to change password');
    }
  }

  async updateProfile(payload: { fullName: string }) {
    try {
      const response = await UsersService.updateProfile(payload);
      return response.data; // Updated profile data
    } catch (error: unknown) {
      const message = error instanceof AxiosError ? error.response?.data?.message : 'Failed to update profile';
      throw new Error(message || 'Failed to update profile');
    }
  }
}
